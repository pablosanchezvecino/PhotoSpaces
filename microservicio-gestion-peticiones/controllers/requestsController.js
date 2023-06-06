// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

import { existsSync, readFileSync, writeFileSync, unlinkSync } from "fs";
import Request from "../models/Request.js";
import Server from "../models/Server.js";
import { sendMail } from "../logic/mailLogic.js";
import { options } from "../constants/sendRenderedImageOptions.js";

const handleNewRequest = async (req, res) => {
  // Obtener parámetros
  const parameters = JSON.parse(req.body.data);

  // Obtener contenido archivo
  const model = req.files.model;

  // Si se especificó envío de email, obtener email
  const email = req.body.email ?? null;

  let bestIdleServer;
  let queue;

  try {
    // Buscar mejor servidor en estado "idle"
    bestIdleServer = await Server.findOne({ status: "idle" })
      .sort({
        timeSpentOnRenderTest: "asc",
      })
      .exec();

    // Comprobar la cola
    queue = await Request.find({ status: "enqueued" });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "Error interno al consultar la base de datos" });
    return;
  }

  // Obtener dirección IP del cliente
  let ip = req.headers["x-forwarded-for"] || req.ip;

  // Si se recibe una dirección IPv4 embebida en una dirección IPv6
  if (ip.toString().startsWith("::ffff:")) {
    // Extraer IPv4
    ip = ip.toString().slice(7);
  }

  const request = new Request({
    clientIp: ip,
    parameters: parameters,
  });

  if (email) {
    request.email = email;
  }

  if (queue.length === 0 && bestIdleServer) {
    // La cola está vacía y hay al menos un servidor en estado "idle"

    try {
      res
        .status(200)
        .send({ requestId: request._id, requestStatus: "processing" });
      await forwardRequest(request, bestIdleServer, model);
    } catch (error) {
      console.error(error);
      // res.status(500).send("Error durante el reenvío de la petición");
    }

    // Comprobar si al terminar con la petición se puede ir reenviando otra encolada
    processQueue();
  } else {
    // Hay peticiones por delante en la cola o la cola está vacía pero todos los servidores están ocupados

    // Encolar la petición
    enqueueRequest(request, model);

    if (!email) {
      res
        .status(200)
        .send({ requestId: request._id, requestStatus: "enqueued" });
    }
  }
};

const forwardRequest = async (request, bestIdleServer, model) => {
  bestIdleServer.status = "busy";
  await bestIdleServer.save();
  
  return new Promise((resolve, reject) => {
    // Enviar petición al servidor disponible más adecuado
    console.log(`Reenviando petición a ${bestIdleServer.name}...`.magenta);


    request.status = "processing";
    request.assignedServer = bestIdleServer.name;

    // Enviar petición a servidor de renderizado
    const formData = new FormData();
    formData.append("requestId", request._id);

    if (model) {
      // La petición no ha pasado por la cola y tenemos el modelo en la variable model
      formData.append(
        "model",
        new Blob([Buffer.from(model.data)], { type: "text/plain" })
      );
    } else {
      // La petición estaba ancolada y tenemos el modelo en un archivo temporal
      try {
        const data = readFileSync(`./temp/${request._id}.gltf`);
        formData.append("model", new Blob([data], { type: "text/plain" }));
      } catch (error) {
        console.error(error);
        reject();
      }
    }

    formData.append("data", JSON.stringify(request.parameters));

    request.processingStartTime = new Date();
    request.save();

    let monitorRemainingTimeInterval = null;

    fetch(
      `http://${bestIdleServer.ip}:${process.env.RENDER_SERVER_PORT}/render`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => {
        if (monitorRemainingTimeInterval) {
          clearInterval(monitorRemainingTimeInterval);
        }
        // Pasar a blob el archivo .png devuelto en la respuesta
        return response.blob();
      })
      .then(async (blob) => {
        // Guardar temporalmente archivo .png recibido
        writeFileSync(
          `./temp/${request._id}.png`,
          Buffer.from(await blob.arrayBuffer())
        );

        if (request.email) {
          // Si se indicó envío por email
          // Enviar correo al usuario con la imagen renderizada
          await sendMail(`${request._id}.png`, request.email);
        }

        // Pasar request a "fulfilled"
        request.processingEndTime = new Date();
        request.status = "fulfilled";
        await request.save();

        bestIdleServer.status = "idle";
        await bestIdleServer.save();

        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject();
      });

    // Solo tenemos acceso al tiempo restante estimado si estamos utilizando el motor Cycles
    if (request.parameters.motor === "CYCLES") {
      monitorRemainingTimeInterval = setInterval(async () => {
        console.log("Consultando tiempo a servidor:");
        const estimatedRemainingProcessingTimeResponse = await fetch(
          `http://${bestIdleServer.ip}:${process.env.RENDER_SERVER_PORT}/time`
        );
        const estimatedRemainingProcessingTimeMs = (
          await estimatedRemainingProcessingTimeResponse.json()
        ).estimatedRemainingProcessingTime;
        console.log("Obtenido", estimatedRemainingProcessingTimeMs);
        request.estimatedRemainingProcessingTime =
          estimatedRemainingProcessingTimeMs;
        await request.save();
      }, 2000);
    }
  });
};

const enqueueRequest = async (request, model) => {
  console.log("Encolando petición...".magenta);

  request.status = "enqueued";
  request.queueStartTime = new Date();
  await request.save();

  // Guardar escena temporalmente
  writeFileSync(`./temp/${request._id}.gltf`, Buffer.from(model.data));
};

const processQueue = async () => {
  // Si hay peticiones en la cola, mandarlas al servidor que se acaba de quedar libre
  let firstEnqueuedRequest;
  let bestIdleServer;

  while (
    (firstEnqueuedRequest = await Request.findOne({ status: "enqueued" })
      .sort({
        queueStartTime: "asc",
      })
      .exec()) &&
    (bestIdleServer = await Server.findOne({ status: "idle" })
      .sort({
        timeSpentOnRenderTest: "asc",
      })
      .exec())
  ) {
    await forwardRequest(firstEnqueuedRequest, bestIdleServer, null);
  }
};

const getWaitingInfo = async (req, res) => {
  try {
    // Consutar estado de la petición y el momento en que fue encolada y, en caso de que contara con ella, la estimación del tiempo restante
    const requestInfo = await Request.findById(req.params.requestId)
      .select("queueStartTime estimatedRemainingProcessingTime status")
      .lean();

    let queuePosition = 0;
    let estimatedRemainingProcessingTime =
      requestInfo.estimatedRemainingProcessingTime;

    // Si la petición está encolada
    if (requestInfo.status === "enqueued") {
      // Obtener la posición a partir del número de peticiones actualmente
      // encoladas que fueron introducidas en la cola antes
      queuePosition =
        (await Request.countDocuments({
          queueStartTime: { $lt: requestInfo.queueStartTime },
          status: "enqueued",
        })) + 1;

      // Obtener estimación de tiempo restante de la petición que se está procesando
      // más antigua que esté utilizando el motor Cycles, ya que con Eevee no tenemos
      // acceso al tiempo restante estimado de procesamiento
      estimatedRemainingProcessingTime = (
        await Request.findOne({
          status: "processing",
          estimatedRemianingProcessingTime: { $exists: true },
        })
          .sort({ processingStartTime: "asc" }) // Ordenar en orden ascendente por "processingStartTime"
          .select("estimatedRemainingProcessingTime") // Seleccionar solo el campo "estimatedRemianingProcessingTime"
          .exec()
      ).estimatedRemainingProcessingTime;
      console.log(
        "Tiempo restante ",
        estimatedRemainingProcessingTime,
        "(estaba enqueued)"
      );
    }

    console.log({
      requestQueuePosition: queuePosition,
      processingRequestEstimatedRemainingProcessingTime:
        estimatedRemainingProcessingTime,
      requestStatus: requestInfo.status,
    });

    res.status(200).send({
      requestQueuePosition: queuePosition,
      processingRequestEstimatedRemainingProcessingTime:
        estimatedRemainingProcessingTime,
      requestStatus: requestInfo.status,
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .send({ error: "Error interno en la consulta a la base de datos" });
    return;
  }
};

const transferRenderedImage = (req, res) => {
  try {
    const fileRoute = `./temp/${req.params.requestId}`;

    if (existsSync(`${fileRoute}.png`)) {
      // Enviar imagen renderizada para que el navegador pueda descargarla
      res.status(200).sendFile(`${fileRoute}.png`, options);

      // Hasta que no termine la transferencia no podemos borrar los archivos temporales
      res.on("finish", () => {
        try {
          // Eliminar archivo .png temporal
          unlinkSync(`${fileRoute}.png`);

          // Si había sido necesario guardar el archivo .gltf 
          // porque ha pasado por la cola, eliminarlo tambien
          if (existsSync(`${fileRoute}.gltf`)) {
            unlinkSync(`${fileRoute}.gltf`);
          }
        } catch (error) {
          console.error(`Error asl eliminar los archivos temporales. ${error}`.red);
        }
      });
    } else {
      res
        .status(400)
        .send({ error: "El servidor no cuenta con la imagen solicitada" });
    }
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error interno al enviar la imagen" });
  }
};

export {
  handleNewRequest,
  processQueue,
  getWaitingInfo,
  transferRenderedImage,
};
