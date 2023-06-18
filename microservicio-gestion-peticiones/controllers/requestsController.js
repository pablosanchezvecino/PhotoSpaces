
import { existsSync, readFileSync, writeFileSync, unlinkSync, renameSync } from "fs";
import { isValidEmail, isValidModel } from "../logic/validationLogic.js";
import { options } from "../constants/sendRenderedImageOptions.js";
import PendingEmail from "../models/PendingEmail.js";
import { sendMail } from "../logic/emailLogic.js";
import { wait } from "../logic/timeLogic.js";
import Request from "../models/Request.js";
import Server from "../models/Server.js";
import mongoose from "mongoose";
// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

const handleNewRequest = async (req, res) => {
  // Obtener parámetros
  let parameters = null;
  try {
    parameters = JSON.parse(req.body.data);
  } catch (error) {
    console.error(`Error al intentar obtener parámetros de la petición. ${error}`.red);
    res.status(400).send({ error: "Parámetros especificados no válidos" });
    return;
  }
  
  // Obtener contenido archivo
  const model = req.file;
  if (!model) {
    console.log("Error al intentar obtener el archivo".red);
    res.status(400).send({ error: "No se ha recibido archivo" });
    return;
  }
  
  // Validar archivo
  if (!(await isValidModel(model.filename))) {
    console.error(`Archivo recibido no válido (${model.filename})`.red);
    res.status(400).send({ error: "El archivo recibido no es válido" });
    try {
      unlinkSync(`./temp/${model.filename}`);
    } catch (error) {
      console.error(`Error al eliminar archivo no válido (${model.filename}). ${error}`.red);
    }
    return;
  }
  
  // Obtener dirección IP del cliente
  let ip = req.headers["x-forwarded-for"] || req.ip;
  // Si se recibe una dirección IPv4 embebida en una dirección IPv6
  if (ip.toString().startsWith("::ffff:")) {
    // Extraer IPv4
    ip = ip.toString().slice(7);
  }
  
  // Documento para la petición
  const request = new Request({
    clientIp: ip,
    parameters: parameters
  });
  
  // Si se especificó envío de email, obtener email y validarlo
  const email = req.body.email ?? null;
  if (email) {
    if (isValidEmail(email)) {
      request.email = email;
    } else {
      console.error(`Email recibido no válido (${email}).`.red);
      try {
        unlinkSync(`./temp/${model.filename}`);
      } catch (error) {
        console.error(`Error al eliminar archivo ${model.filename}. ${error}`.red);
      }
      res.status(400).send({ error: "El email recibido no es válido" });
      return;
    }
  }

  // Renombrar archivo temporal generado por multer utilizando el oid de MongoDB
  try {
    renameSync(`./temp/${model.filename}`, `./temp/${request._id}.gltf`);
  } catch (error) {
    console.error(`Error al renombrar el archivo ${model.filename} a ${request._id}.gltf. ${error}`.red);
  }
  


  // Comprobar estado del sistema
  let emptyQueue = null;
  let bestIdleServer = null;
  try {
    // Comprobar si la cola está vacía, aquí no debería haber problemas de condiciones de carrera
    emptyQueue = (await Request.find({ status: "enqueued" })).length === 0;
    // Solo tiene sentido comprobar los servidores disponibles si la cola está vacía
    if (emptyQueue) {
      // Esta operación se realiza de forma atómica cuando solo afecta a un documento y MongoDB utiliza locks
      // para las escrituras, así que no se debería llegar a la situación en que dos peticiones entrantes
      // vean el servidor en estado "idle" y lo adquieran a la vez. 
      bestIdleServer = (await Server.findOneAndUpdate(
        { status: "idle" }, 
        { $set: { status: "busy" } }, 
        { timeSpentOnRenderTest: "asc" },
        { new: true } 
      ));
    }
  } catch (error) {
    console.error(`Error interno durante las consultas a la base de datos de la comprobación inicial del estado del sistema (Petición ${request._id}). ${error}`.red);
    res.status(500).send("Error interno durante las consultas a la base de datos");
    return;
  }
  
  if (emptyQueue && bestIdleServer) {
    // Reenviar petición al servidor de renderizado más adecuado
    // Petición pasa al estado "processing"
    try {
      try {
        request.status = "processing";
        request.assignedServer = bestIdleServer.name;
        request.processingStartTime = new Date();
        await request.save();
      } catch (error) {
        console.error(`Error al intentar persistir el estado de la petición ${request._id} antes del reenvío. ${error}`.red);
        res.status(500).send("Error al intentar persistir el estado de la petición antes del reenvío");
        return;
      }

      await forwardRequest(res, request, bestIdleServer);

    } catch (error) {
      console.error(`Error durante el reenvío de la petición ${request._id}. ${error}`.red);
    }
    
  } else {
    // Hay peticiones por delante en la cola o la cola está vacía pero todos los servidores están ocupados
    try {
      // Encolar la petición
      await enqueueRequest(request);
      res.status(200).send({ requestId: request._id, requestStatus: "enqueued" });
    } catch (error) {
      console.error(`Error interno al intentar encolar la petición ${request._id}. ${error}`.red);
      res.status(500).send("Error interno al intentar encolar la petición");
      return;
    }
  }
};

const forwardRequest = async (res, request, bestIdleServer) => {
  console.log(`Reenviando petición ${request._id} a ${bestIdleServer.name}...`.magenta);
  
  // Enviar petición al servidor disponible más adecuado
  return new Promise((resolve, reject) => {
    // Construir FormData
    const formData = new FormData();
    formData.append("requestId", request._id);
    try {
      const data = readFileSync(`./temp/${request._id}.gltf`);
      formData.append("data", JSON.stringify(request.parameters));
      formData.append("model", new Blob([data], { type: "model/gltf+json" }));
    } catch (error) {
      console.error(`Error en la lectura del fichero ${request._id}.gltf para su envío al servidor de renderizado`);
      res.status(500).send("Error durante el reenvío de la petición");
      reject();
    }
    
    // Enviar petición a servidor de renderizado
    fetch(
      `http://${bestIdleServer.ip}:${process.env.RENDER_SERVER_PORT}/render`,
      {
        method: "POST",
        body: formData
      }
    )
      .then((response) => {
        if (response.ok) {
          request.processingEndTime = new Date();
          // Pasar a blob el archivo .png devuelto en la respuesta
          return response.blob();
        } else {
          throw new Error(`Código erróneo obtenido en la respuesta del servidor. ${response.json().error}`);
        }
      })
      .then(async (blob) => {
        // Guardar temporalmente archivo .png recibido
        try {
          writeFileSync(`./temp/${request._id}.png`, Buffer.from(await blob.arrayBuffer()));
        } catch (error) {
          throw new Error(`Error en la escritura del archivo con imagen renderizada ${request._id}.png. ${error}`.red);
        }
        
        // Si se indicó envío por email
        if (request.email) {
          // Enviar correo al usuario con la imagen renderizada
          console.log(`Enviando correo (Petición ${request._id})...`.magenta);

          sendMail(`${request._id}.png`, request.email)
            .then(async () => {
              console.log(`Correo enviado (Petición ${request._id})`.magenta);
              try {
                console.log(`Archivo ${request._id}.png enviado`.magenta);
                // Eliminar archivos .gltf y .png temporales
                unlinkSync(`./temp/${request._id}.png`);
                unlinkSync(`./temp/${request._id}.gltf`);
              } catch (error) {
                console.error(`Error al eliminar los archivos temporales tras el envío por email (Petición ${request._id}). ${error}`.red);
              }
            })
            .catch(async (error) => { 
              console.error(`Error en el envío del correo con la imagen renderizada (Petición ${request._id}). ${error}`.red);
              // Persistimos archivo png y dirección de correo electrónico para que se intente el reenvío más tarde
              try {
                const newPendingEmail = new PendingEmail({
                  _id: request._id,
                  email: request.email,
                  pngFileContent: readFileSync(`./temp/${request._id}.png`)
                });
                await newPendingEmail.save();
                console.log(`Información necesaria para el reenvío del email correspondiente a la petición ${request._id} persisitida correctamente`.magenta);
    
              } catch (error) {
                console.error(`Error al persistir la información necesaria para el reenvío del email correspondiente a la petición ${request._id}. ${error}`.red);
              }
            });

          
          
        }

        // Pasar petición a "fulfilled"
        console.log(`Completando petición ${request._id} en BD...`.magenta);
        try {
          request.status = "fulfilled";
          await request.save();
          console.log(`Petición ${request._id} completada en BD`.magenta);
        } catch (error) {
          throw new Error(`Error al intentar persistir el estado de la petición ${request._id} tras el envío por email. ${error}`.red);
        }

        console.log(`Liberando servidor ${request.assignedServer} en BD...`.magenta);
        try {
          await Server.findByIdAndUpdate(bestIdleServer._id, { status: "idle" });
          console.log(`Servidor ${request.assignedServer} liberado en BD`.magenta);
        } catch (error) {
          throw new Error(`Error al intentar persistir el estado del servidor tras la finalización del renderizado. ${error}`.red);
        }
        
        resolve();

        // Comprobar si al terminar con la petición se puede ir reenviando otra encolada
        console.log(`Petición ${request._id} finalizada`.magenta);
        processQueue();
      })
      .catch((error) => {
        console.error(`Error en la comunicación con el servidor de renderizado ${request.assignedServer}. ${error}`.red);
        reject();
      });

    if (res) {
      res.status(200).send({ requestId: request._id, requestStatus: "processing" });
    }
      
      
    // Solo tenemos acceso al tiempo restante estimado si estamos utilizando el motor Cycles
    if (request.parameters.engine === "CYCLES") {
      
      const polling = async () => {
        
        while (request.status !== "fulfilled") {
          await wait(process.env.RENDERING_SERVER_POLLING_INTERVAL_MS || 1000);
          console.log(`Consultando tiempo a servidor (Petición ${request._id}):`.green);
          try {
            const estimatedRemainingProcessingTimeResponse = await fetch(`http://${bestIdleServer.ip}:${process.env.RENDER_SERVER_PORT}/time`);
            if (estimatedRemainingProcessingTimeResponse.ok) {
              const estimatedRemainingProcessingTimeMs = (await estimatedRemainingProcessingTimeResponse.json()).estimatedRemainingProcessingTime;
              console.log(`Obtenido ${estimatedRemainingProcessingTimeMs}`.green);
              request.estimatedRemainingProcessingTime = estimatedRemainingProcessingTimeMs;
              await request.save();
            } else {
              console.error(
                `Obtenido código de respuesta ${estimatedRemainingProcessingTimeResponse.status} al consultar el tiempo restante estimado del servidor de renderizado ${bestIdleServer.name}. 
                ${(await estimatedRemainingProcessingTimeResponse.json()).error}`
              );
            }
          } catch (error) {
            console.error(`Error al intentar obtener tiempo restante estimado del servidor de renderizado ${bestIdleServer.name}. ${error}`);
          }
        }

      };
      polling();
    }
  });
};

const enqueueRequest = async (request) => {
  try {
    console.log(`Encolando petición ${request._id}...`.magenta);
    request.status = "enqueued";
    request.queueStartTime = new Date();
    await request.save();
  } catch (error) {
    throw new Error(`Error interno al persistir la petición ${request._id} en la base de datos. ${error}`);
  }
};

const processQueue = async () => {
  console.log("Comprobando cola...".bold.green);
  let firstEnqueuedRequest = null;
  let bestIdleServer = null;
  let session = null;

  try {
    session = await mongoose.startSession();
    session.startTransaction();
    
    firstEnqueuedRequest = await Request.findOne({ status: "enqueued" }).sort({ queueStartTime: "asc" }).session(session);
    
    if (firstEnqueuedRequest) {
      bestIdleServer = (await Server.findOne({ status: "idle" }).sort({ timeSpentOnRenderTest: "asc" }).session(session));
    }
      
    if (firstEnqueuedRequest && bestIdleServer) {
      console.log(`Petición extraíble encontrada (Petición ${firstEnqueuedRequest._id} a servidor ${bestIdleServer.name})`.bold.green);
      firstEnqueuedRequest.status = "processing";
      firstEnqueuedRequest.assignedServer = bestIdleServer.name;
      firstEnqueuedRequest.processingStartTime = new Date();
      await firstEnqueuedRequest.save();

      bestIdleServer.status = "busy";
      await bestIdleServer.save();

      await session.commitTransaction();

      forwardRequest(null, firstEnqueuedRequest, bestIdleServer);
    } else {
      console.log("No es posible extraer peticiones de la cola en este momento".bold.green);
      await session.abortTransaction();
    }
    

    await session.endSession();

  } catch (error) {
    await session.abortTransaction();
    await session.endSession();
    console.error(`Error interno durante la extracción de peticiones encoladas. ${error}`.red);
    return;
  }

};

const getWaitingInfo = async (req, res) => {
  try {
    // Consutar estado de la petición y el momento en que fue encolada y, en caso de que contara con ella, la estimación del tiempo restante
    const requestInfo = await Request.findById(req.params.requestId).select("queueStartTime estimatedRemainingProcessingTime status").lean();

    let queuePosition = 0;
    let estimatedRemainingProcessingTime = requestInfo.estimatedRemainingProcessingTime;

    // Si la petición está encolada
    if (requestInfo.status === "enqueued") {
      // Obtener la posición a partir del número de peticiones actualmente
      // encoladas que fueron introducidas en la cola antes
      queuePosition = (await Request.countDocuments({
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
      )?.estimatedRemainingProcessingTime ?? null;
      
      console.log(
        "Tiempo restante ",
        estimatedRemainingProcessingTime,
        "(estaba enqueued)"
      );
    }

    console.log({
      requestQueuePosition: queuePosition,
      processingRequestEstimatedRemainingProcessingTime: estimatedRemainingProcessingTime,
      requestStatus: requestInfo.status,
    });

    res.status(200).send({
      requestQueuePosition: queuePosition,
      processingRequestEstimatedRemainingProcessingTime: estimatedRemainingProcessingTime,
      requestStatus: requestInfo.status,
    });

  } catch (error) {
    console.error(`Error interno en las consultas a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error interno en las consultas a la base de datos" });
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
          console.log(`Archivo ${fileRoute}.png enviado`.magenta);
          // Eliminar archivos .gltf y .png temporales
          unlinkSync(`${fileRoute}.png`);
          unlinkSync(`${fileRoute}.gltf`);
        } catch (error) {
          console.error(`Error al eliminar los archivos temporales. ${error}`.red);
        }
      });

    } else {
      res.status(400).send({ error: "El servidor no cuenta con la imagen solicitada" });
    }
  } catch (error) {
    console.error(`Error interno en el envío de la imagen renderizada. ${error}`.red);
    res.status(500).send({ error: "Error interno en el envío de la imagen renderizada" });
  }
};

export {
  handleNewRequest,
  processQueue,
  getWaitingInfo,
  transferRenderedImage,
};
