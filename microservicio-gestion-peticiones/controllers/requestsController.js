// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

import { readFileSync, writeFileSync, unlinkSync } from "fs";
import Request from "../models/Request.js";
import Server from "../models/Server.js";
import { sendMail } from "../logic/mailLogic.js";

const handleNewRequest = async (req, res) => {
  // Obtener parámetros
  const parameters = JSON.parse(req.body.data);

  // Obtener contenido archivo
  const model = req.files.model;
  // Buscar mejor servidor en estado "idle"
  let bestIdleServer = await Server.findOne({ status: "idle" })
    .sort({
      timeSpentOnRenderTest: "asc",
    })
    .exec();

  // Comprobar la cola
  let queue = await Request.find({ status: "enqueued" });

  // Obtener dirección IP del cliente
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  if (queue.length === 0 && bestIdleServer !== null) {
    // La cola está vacía y hay al menos un servidor en estado "idle"
    try {
      const newRequest = new Request({
        clientIp: ip,
        parameters: parameters,
      });

      await forwardRequest(newRequest, bestIdleServer, model);
      res.status(200).send();
    } catch (error) {
      console.error(error);
      res.status(500).send("Error durante el reenvío de la petición");
    }

    processQueue();
  } else {
    // Hay peticiones por delante en la cola o la cola está vacía pero todos los servidores están ocupados
    // Encolar ña petición
    enqueueRequest(ip, parameters, model);
  }
};

const forwardRequest = async (request, bestIdleServer, model) => {
  return new Promise((resolve, reject) => {
    // Enviar petición al servidor disponible más adecuado
    console.log(`Reenviando petición a ${bestIdleServer.name}...`.magenta);

    bestIdleServer.status = "busy";
    bestIdleServer.save();

    request.status = "processing";
    request.assignedServer = bestIdleServer.name;

    // Enviar petición a servidor de renderizado
    const formData = new FormData();
    formData.append("requestId", request._id);

    if (model !== null) {
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

    fetch(
      `http://${bestIdleServer.ip}:${process.env.RENDER_SERVER_PORT}/render`,
      {
        method: "POST",
        body: formData,
      }
    )
      .then((response) => {
        // Pasar a blob el archivo .png devuelto en la respuesta
        return response.blob();
      })
      .then(async (blob) => {
        // Guardar temporalmente archivo .png recibido
        writeFileSync(
          `./temp/${request._id}.png`,
          Buffer.from(await blob.arrayBuffer())
        );

        // Enviar correo al usuario con la imagen renderizada
        await sendMail(`${request._id}.png`, "pablosanchezvecino@gmail.com");

        // Eliminar archivo .png temporal
        unlinkSync(`./temp/${request._id}.png`);

        // Pasar request a "fulfilled"
        request.processingEndTime = new Date();
        request.status = "fulfilled";
        request.save();

        bestIdleServer.status = "idle";
        bestIdleServer.save();

        resolve();
      })
      .catch((error) => {
        console.error(error);
        reject();
      });
  });
};

const enqueueRequest = (ip, parameters, model) => {
  console.log("Encolando petición...".magenta);

  const newRequest = new Request({
    clientIp: ip,
    parameters: parameters,
    status: "enqueued",
    queueStartTime: new Date(),
  });

  newRequest.save();

  // Guardar escena temporalmente
  writeFileSync(`./temp/${newRequest._id}.gltf`, Buffer.from(model.data));
};

const processQueue = async () => {
  // Si hay peticiones en la cola, mandarlas al servidor que se acaba de quedar libre
  let firstEnqueuedRequest;
  let bestIdleServer;
  while (
    ((firstEnqueuedRequest = await Request.findOne({ status: "enqueued" })
      .sort({
        queueStartTime: "asc",
      })
      .exec()) ??
      false) &&
    ((bestIdleServer = await Server.findOne({ status: "idle" })
      .sort({
        timeSpentOnRenderTest: "asc",
      })
      .exec()) ??
      false)
  ) {
    await forwardRequest(firstEnqueuedRequest, bestIdleServer, null);
  }
};

export { handleNewRequest, processQueue };
