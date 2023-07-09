
import { extensionFromFilename, extensionToMimeType, generateGltfFromGlb, generateDracoFromGltf } from "../logic/fileLogic.js";
import { existsSync, readFileSync, writeFileSync, unlinkSync, renameSync, statSync } from "fs";
import { isValidEmail, isValidModel, isValidDracoCompressionLevel } from "../logic/validationLogic.js";
import { options } from "../constants/sendRenderedImageOptions.js";
import { processIpAddress } from "../logic/ipAddressLogic.js";
import PendingEmail from "../models/PendingEmail.js";
import { sendMail } from "../logic/emailLogic.js";
import { wait } from "../logic/timeLogic.js";
import Request from "../models/Request.js";
import Server from "../models/Server.js";
import mongoose from "mongoose";
import path from "path";


// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

const handleNewRequest = async (req, res) => {
  // Obtener parámetros
  let parameters = null;
  try {
    parameters = JSON.parse(req.body.data);
  } catch (error) {
    console.error(`Error al intentar obtener parámetros de la petición. ${error}`.red);
    // Si se recibió archivo también, eliminarlo
    if (req.file) {
      try {
        unlinkSync(`./temp/${req.file.filename}`);
      } catch (error) {
        console.error(`Error al eliminar archivo ${req.file.filename}. ${error}`.red);
      }
    }
    res.status(400).send({ error: "Parámetros especificados no válidos" });
    return;
  }
  
  // Obtener contenido archivo
  const model = req.file;
  if (!model) {
    console.error("Error al intentar obtener el archivo".red);
    res.status(400).send({ error: "No se ha recibido archivo o este no tenía un tipo MIME válido" });
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
  let ip = processIpAddress(req.headers["x-forwarded-for"] || req.ip);

  // Documento para la petición
  const request = new Request({
    clientIp: ip,
    parameters: parameters,
    fileExtension: extensionFromFilename(model.filename)
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

  // Si se especificó compresión con Draco, comprimir el archivo recibido
  if (req.body.dracoCompressionLevel !== undefined) {
    
    let dracoCompressionLevel = null;
    if (!isValidDracoCompressionLevel(req.body.dracoCompressionLevel)) {
      dracoCompressionLevel = parseInt(dracoCompressionLevel);
      console.error(`Nivel de compresión Draco recibido no válido (${dracoCompressionLevel})`.red);
      res.status(400).send({ error: "Nivel de compresión Draco recibido no válido" });
      return;
    }

    // Si se recibió archivo .glb
    if (extensionFromFilename(model.filename) === ".glb") {
      try {
        // Primero pasarlo a .gltf
        await generateGltfFromGlb(`./temp/${model.filename}`);
        // Borrar archivo .glb
        try {
          unlinkSync(`./temp/${model.filename}`);
        } catch (error) {
          console.error(`Error al eliminar el archivo .glb tras transformarlo a .gltf (Petición ${request._id}). ${error}`.red);
        }
      } catch (error) {
        console.error(`Error al convertir el archivo .glb a .gltf (Petición ${request._id}). ${error}`.red);
        res.status(500).send({ error: "Error al transformar el archivo .glb a .gltf" });
        return;
      }
    }
    try {
      // Comprimir archivo .gltf a .drc
      await generateDracoFromGltf(`./temp/${path.basename(model.filename, path.extname(model.filename))}.gltf`, dracoCompressionLevel);
      // Borrar archivo .gltf
      try {
        unlinkSync(`./temp/${path.basename(model.filename, path.extname(model.filename))}.gltf`);
      } catch (error) {
        console.error(`Error al eliminar el archivo .gltf tras comprimirlo a .drc (Petición ${request._id}). ${error}`.red);
      }
    } catch (error) {
      console.error(`Error al comprimir el archivo .gltf con Draco (Petición ${request._id}). ${error}`.red);
      res.status(500).send({ error: "Error al comprimir el archivo .gltf con Draco" });
      return;
    }
    request.fileExtension = ".drc";
  }
  
  // Aquí ya tenemos el archivo que se va a enviar al servidor
  // Obtener su peso en bytes
  const fileSize = statSync(`./temp/${path.basename(model.filename, path.extname(model.filename))}${request.fileExtension}`).size;
  request.fileSize = fileSize;

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
        { sort: { timeSpentOnRenderTest: 1 } },
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

        // Renombrar archivo temporal generado por multer utilizando el oid de MongoDB
        try {
          renameSync(`./temp/${path.basename(model.filename, path.extname(model.filename))}${request.fileExtension}`, `./temp/${request._id}${request.fileExtension}`);
        } catch (error) {
          console.error(`Error al renombrar el archivo ${model.filename} a ${request._id}${request.fileExtension}. ${error}`.red);
        }

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

      // Renombrar archivo temporal generado por multer utilizando el oid de MongoDB
      try {
        renameSync(`./temp/${path.basename(model.filename, path.extname(model.filename))}${request.fileExtension}`, `./temp/${request._id}${request.fileExtension}`);
      } catch (error) {
        console.error(`Error al renombrar el archivo ${model.filename} a ${request._id}${request.fileExtension}. ${error}`.red);
      }

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
      const data = readFileSync(`./temp/${request._id}${request.fileExtension}`);
      formData.append("data", JSON.stringify(request.parameters));
      formData.append("model", new Blob([data], { type: extensionToMimeType(request.fileExtension) }));
    } catch (error) {
      console.error(`Error en la lectura del fichero ${request._id}${request.fileExtension} para su envío al servidor de renderizado. ${error}`.red);
      if (res) {
        res.status(500).send("Error durante el reenvío de la petición");
      }
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
      .then(async (response) => {
        if (response.ok) {
          request.processingEndTime = new Date();
          return response.json();
        } else {
          throw new Error(`Código erróneo obtenido en la respuesta del servidor. ${(await response.json()).error}`);
        }
      })
      .then(async (jsonContent) => {
        // Guardar temporalmente archivo .png recibido
        const binaryData = Buffer.from(jsonContent.renderedImage, "base64");
        try {
          writeFileSync(`./temp/${request._id}.png`, binaryData, "binary");
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
                try {
                  request.nonDeletableFile = false;
                  await request.save();
                } catch (error) {
                  console.error(`Error al desactivar flag nonDeletableFile en la base de datos (Petición ${request._id}). ${error}`.red);
                }
                // Eliminar archivos de escena y .png temporales
                unlinkSync(`./temp/${request._id}.png`);
                unlinkSync(`./temp/${request._id}${request.fileExtension}`);
              } catch (error) {
                console.error(`Error al eliminar los archivos temporales tras el envío por email (Petición ${request._id}). ${error}`.red);
              }
            })
            .catch(async (error) => { 
              console.error(`Error en el envío del correo con la imagen renderizada (Petición ${request._id}). ${error}`.red);
              // Persistir archivo .png y dirección de correo electrónico para que se intente el reenvío más tarde
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
          request.nonDeletableFile = true;
          request.totalBlenderTime = jsonContent.totalBlenderTime;
          await request.save();
          console.log(`Petición ${request._id} completada en BD`.magenta);
        } catch (error) {
          throw new Error(`Error al intentar persistir el estado de la petición ${request._id} una vez procesada. ${error}`.red);
        }

        console.log(`Liberando servidor ${request.assignedServer} en BD...`.magenta);
        try {
          if (request.parameters.engine === "CYCLES") {
            // Actualizar estadísticas de Cycles
            await Server.findByIdAndUpdate(bestIdleServer._id, {
              $inc: { fulfilledRequestsCount: 1, totalCyclesNeededTime: (request.processingEndTime - request.processingStartTime), totalCyclesBlenderTime: jsonContent.totalBlenderTime, totalCyclesProcessedBytes: request.fileSize },
              status: "idle",
              cyclesProcessedBytesPerMillisecondOfNeededTime: (bestIdleServer.totalCyclesProcessedBytes + request.fileSize) / (bestIdleServer.totalCyclesNeededTime + request.processingEndTime.getTime() - request.processingStartTime.getTime())
            });
          } else {
            // Actualizar estadísticas de Eevee
            await Server.findByIdAndUpdate(bestIdleServer._id, {
              $inc: { fulfilledRequestsCount: 1, totalEeveeNeededTime: (request.processingEndTime - request.processingStartTime), totalEeveeBlenderTime: jsonContent.totalBlenderTime, totalEeveeProcessedBytes: request.fileSize },
              status: "idle",
              eeveeProcessedBytesPerMillisecondOfNeededTime: (bestIdleServer.totalEeveeProcessedBytes + request.fileSize) / (bestIdleServer.totalEeveeNeededTime + request.processingEndTime.getTime() - request.processingStartTime.getTime())
            });
          }
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
        let errorCodeCount = 0;
        while (request.status !== "fulfilled" && errorCodeCount <= 10) {

          await wait(process.env.RENDERING_SERVER_POLLING_INTERVAL_MS || 1000);

          console.log(`Consultando tiempo a servidor (Petición ${request._id}):`.green);
          
          try {
            const response = await fetch(`http://${bestIdleServer.ip}:${process.env.RENDER_SERVER_PORT}/time`);
            if (response.ok) {
              const estimatedRemainingProcessingTimeMs = (await response.json()).estimatedRemainingProcessingTime;
              console.log(`Obtenido ${estimatedRemainingProcessingTimeMs}`.green);
              request.estimatedRemainingProcessingTime = estimatedRemainingProcessingTimeMs;
              await request.save();
            } else {
              errorCodeCount++;
              console.error(`Obtenido código de respuesta ${response.status} al consultar el tiempo restante estimado del servidor de renderizado ${bestIdleServer.name}. ${(await response.json()).error}`.red);
            }
          } catch (error) {
            console.error(`Error al intentar obtener tiempo restante estimado del servidor de renderizado ${bestIdleServer.name}. ${error}`.red);
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
    throw new Error(`Error interno al persistir la petición ${request._id} en la base de datos. ${error}`.red);
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

      await forwardRequest(null, firstEnqueuedRequest, bestIdleServer);
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

    // console.log({
    //   requestQueuePosition: queuePosition,
    //   processingRequestEstimatedRemainingProcessingTime: estimatedRemainingProcessingTime,
    //   requestStatus: requestInfo.status,
    // });

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

const transferRenderedImage = async (req, res) => {
  
  // Oid no válido
  if (!mongoose.isValidObjectId(req.params.id)) {
    console.error(`Recibido parámetro id no válido (${req.params.id})`.red);
    res.status(400).send({ error: "El parámetro id no es válido" });
    return;
  }
  
  // Buscar petición en BD
  let request = null;
  try {
    request = await Request.findById(req.params.id);
  } catch (error) {
    console.error(`Error en la consulta en la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en en la consulta en la base de datos" });
    return;
  }

  // No se encuentra el servidor
  if (!request) {
    console.error(`Petición de renderizado asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema" });
    return;
  }

  // Se envará la imagen solo si la petición procede de la misma dirección IP que la solicitó
  let ip = processIpAddress(req.headers["x-forwarded-for"] || req.ip);
  
  if (ip !== request.clientIp) {
    res.status(403).send("Acceso denegado"); 
    return;
  }


  try {

    const fileRoute = `./temp/${req.params.id}`;

    if (existsSync(`${fileRoute}.png`)) {

      // Enviar imagen renderizada para que el navegador pueda descargarla
      res.status(200).sendFile(`${fileRoute}.png`, options);

      // Hasta que no termine la transferencia no podemos borrar los archivos temporales
      res.on("finish", async () => {
        try {
          console.log(`Archivo ${fileRoute}.png enviado`.magenta);
          try {
            request.nonDeletableFile = false;
            await request.save();
          } catch (error) {
            console.error(`Error al desactivar flag nonDeletableFile en la base de datos (Petición ${req.params.id}). ${error}`.red);
          }
          // Eliminar archivos de escena y .png temporales
          unlinkSync(`${fileRoute}.png`);
          unlinkSync(`${fileRoute}${request.fileExtension}`);
        } catch (error) {
          console.error(`Error al eliminar los archivos temporales (Petición ${request._id}). ${error}`.red);
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