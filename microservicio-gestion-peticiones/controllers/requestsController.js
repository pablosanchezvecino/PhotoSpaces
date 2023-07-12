
import { extensionFromFilename, extensionToMimeType, generateGltfFromGlb, generateDracoFromGltf } from "../logic/fileLogic.js";
import { existsSync, readFileSync, writeFileSync, unlinkSync, renameSync, statSync } from "fs";
import { isValidEmail, isValidModel, isValidDracoCompressionLevel } from "../logic/validationLogic.js";
import { options } from "../constants/sendRenderedImageOptions.js";
import { processIpAddress } from "../logic/ipAddressLogic.js";
import PendingEmail from "../models/PendingEmail.js";
import { sendMail } from "../logic/emailLogic.js";
import { performPolling } from "../logic/pollingLogic.js";
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
    fileExtension: extensionFromFilename(model.filename),
    sentFile: false
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
  try {
    const fileSize = statSync(`./temp/${path.basename(model.filename, path.extname(model.filename))}${request.fileExtension}`).size;
    request.fileSize = fileSize;
  } catch (error) {
    console.error(`Error al intentar obtener el tamaño del fichero recibido (Petición ${request._id}). ${error}`.red);
    res.status(500).send({ error: "Error al intentar obtener el tamaño del fichero recibido" });
    return;
  }














































































































































































































  // Comprobar estado del sistema
  let bestIdleServer = null;
  let totalEngineProcessedBytes = request.parameters.engine === "CYCLES" ? "totalCyclesProcessedBytes" : "totalEeveeProcessedBytes";
  let engineProcessedBytesPerMillisecondOfNeededTime = request.parameters.engine === "CYCLES" ? "cyclesProcessedBytesPerMillisecondOfNeededTime" : "eeveeProcessedBytesPerMillisecondOfNeededTime";

  // Intentar reenvío directo

  try {
    // Comprobar que no haya una petición encolada sin servidor asignado,
    // ya que esta última tendría prioridad
    const unassignedEnqueuedRequest = await Request.exists({ status: "enqueued", assignedServer: null });
  
    if (!unassignedEnqueuedRequest) {console.log("CONSULTA 1");
      // Buscar servidor en estado "idle" que no haya recibido peticiones aún
      // con el mismo motor que la petición que hemos recibido (de los
      // posibles candidatos, seleccionar el que menos tiempo haya tardado
      // en llevar a cabo el renderizado de prueba)
      bestIdleServer = (await Server.findOneAndUpdate(
        { status: "idle", [totalEngineProcessedBytes]: 0, enqueuedRequests: 0 }, 
        { $set: { status: "busy" } }, 
        { sort: { timeSpentOnRenderTest: 1 } },
        { new: true } 
      ));
    
      // Si no se encuentra servidor 
      if (!bestIdleServer) { console.log("CONSULTA 2");
        // Buscar cualquier otro servidor en estado "idle", (de los
        // posibles candidatos, seleccionar el que mayor número de
        // B/ms tenga para el motor indicado en la peticion recibida)
        bestIdleServer = await Server.findOneAndUpdate(
          { status: "idle", enqueuedRequests: 0 },
          { $set: { status: "busy" } },
          { sort: { [engineProcessedBytesPerMillisecondOfNeededTime]: -1 } },
          { new: true } 
        );
      }
    } 

  } catch (error) {
    res.status(500).send("Error interno durante las consultas a la base de datos");
    return;
  }

  // Es posible reenvío directo, enviar /render con archivo
  if (bestIdleServer) {
    try { 

      await forwardRequest(res, request, bestIdleServer, model.filename)
        .catch((error) => {
          console.error(`Error durante el reenvío directo de la petición ${request._id}. ${error}`.red);
        });

    } catch (error) {
      console.error(`Error durante el reenvío directo de la petición ${request._id}. ${error}`.red);
    }

  } else  {
    // Es necesario encolar
    try { 

      await enqueueRequest(res, request, model.filename);

    } catch (error) {
      console.error(`Error durante el reenvío directo de la petición ${request._id}. ${error}`.red);
    }
  }
  
  






















    
};

const forwardRequest = async (res, request, server, originalFilename) => {
  console.log(`Reenviando petición ${request._id} a ${server.name}...`.magenta);
  // Actualizar petición
  try {
    request.status = "processing";
    request.assignedServer = server.name;
    request.processingStartTime = new Date();
    await request.save();

  } catch (error) {
    console.error(`Error al intentar persistir el estado de la petición ${request._id} antes del reenvío. ${error}`.red);
    res.status(500).send("Error al intentar persistir el estado de la petición antes del reenvío");
    return;
  }
  
  // Si va a ser reenviada directamente, todavía no se ha renombrado el fichero
  if (res) {
    // Renombrar archivo temporal generado por multer utilizando el oid de MongoDB
    try {
      renameSync(`./temp/${path.basename(originalFilename, path.extname(originalFilename))}${request.fileExtension}`, `./temp/${request._id}${request.fileExtension}`);
    } catch (error) {
      console.error(`Error al renombrar el archivo ${originalFilename} a ${request._id}${request.fileExtension}. ${error}`.red);
    }
  }

  // Enviar petición al servidor disponible más adecuado
  return new Promise((resolve, reject) => {
    // Construir FormData
    const formData = new FormData();
    try {
      formData.append("data", JSON.stringify(request.parameters));
      formData.append("requestId", request._id);
      // Si no se ha llevado acabo la transferencia previa del fichero, enviarlo ahora
      if (!request.sentFile) {
        const data = readFileSync(`./temp/${request._id}${request.fileExtension}`);
        formData.append("model", new Blob([data], { type: extensionToMimeType(request.fileExtension) }));
      } else {
        formData.append("filename", `${request._id}${request.fileExtension}`);
      }
    } catch (error) {
      console.error(`Error en la lectura del fichero ${request._id}${request.fileExtension} para su envío al servidor de renderizado. ${error}`.red);
      if (res) {
        res.status(500).send("Error durante el reenvío de la petición");
      }
      reject();
    }
    
    // Enviar petición a servidor de renderizado
    fetch(
      `http://${server.ip}:${process.env.RENDER_SERVER_PORT}/render`,
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
                  Request.findByIdAndUpdate(
                    request._id,
                    { nonDeletableFile: false },
                    { new: true }
                  );

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

        // Actualizar la petición a completada
        console.log(`Petición ${request._id} finalizada`.magenta);

        try {
          request = await Request.findByIdAndUpdate(
            request._id, 
            { status: "fulfilled", nonDeletableFile: true, totalBlenderTime: jsonContent.totalBlenderTime, processingEndTime: request.processingEndTime },
            { new: true }
          );

          console.log(`Petición ${request._id} completada en BD`.magenta);
        } catch (error) {
          throw new Error(`Error al intentar persistir el estado de la petición ${request._id} una vez procesada. ${error}`.red);
        }

        console.log(`Actualizando servidor ${request.assignedServer}...`.magenta);
        //TODO: QUITAR?
        // Comprobar si el servidor tiene peticiones encoladas
        let firstEnqueuedRequest = null;
        try {
          firstEnqueuedRequest = await Request.findOne({ status: "enqueued", sentFile: true, assignedServer: request.assignedServer }).sort({ queueStartTime: 1 });
        } catch (error) {
          console.error(`Error al comprobar si existen peticiones encoladas para el servidor ${request.assignedServer}`.red);
        }



        try {
          if (request.parameters.engine === "CYCLES") {
            // Actualizar estadísticas de Cycles
            await Server.findByIdAndUpdate(server._id, {
              $inc: { fulfilledRequestsCount: 1, totalCyclesNeededTime: (request.processingEndTime - request.processingStartTime + (request.transferTime || 0)), totalCyclesBlenderTime: jsonContent.totalBlenderTime, totalCyclesProcessedBytes: request.fileSize },
              status: firstEnqueuedRequest ? "busy" : "idle",
              cyclesProcessedBytesPerMillisecondOfNeededTime: (server.totalCyclesProcessedBytes + request.fileSize) / (server.totalCyclesNeededTime + request.processingEndTime.getTime() - request.processingStartTime.getTime() + (request.transferTime || 0))
            });
          } else {
            // Actualizar estadísticas de Eevee
            await Server.findByIdAndUpdate(server._id, {
              $inc: { fulfilledRequestsCount: 1, totalEeveeNeededTime: (request.processingEndTime - request.processingStartTime + (request.transferTime || 0) ), totalEeveeBlenderTime: jsonContent.totalBlenderTime, totalEeveeProcessedBytes: request.fileSize },
              status: firstEnqueuedRequest ? "busy" : "idle",
              eeveeProcessedBytesPerMillisecondOfNeededTime: (server.totalEeveeProcessedBytes + request.fileSize) / (server.totalEeveeNeededTime + request.processingEndTime.getTime() - request.processingStartTime.getTime() + (request.transferTime || 0))
            });
          }
          console.log(`Servidor ${request.assignedServer} actualizado en BD`.magenta);
        } catch (error) {
          throw new Error(`Error al intentar persistir el estado del servidor tras la finalización del renderizado. ${error}`);
        }
        
        // El servidor tiene otra petición encolada que puede ir procesando
        if (firstEnqueuedRequest) {
          // Decrementar número de peticiones encoladas del servidor
          try {
            server = await Server.findByIdAndUpdate(
              server._id, 
              { $inc: { enqueuedRequestsCount: -1 } },
              { new: true }
            );
          } catch (error) {
            throw new Error(`Error al intentar decrementar el número de peticiones encoladas del servidor ${server.name}. ${error}`);
          }

          // Comenzar a procesar la siguiente petición
          console.log(`Extrayendo petición ${firstEnqueuedRequest._id} de la cola del servidor ${request.assignedServer}`.yellow);

          try {
            forwardRequest(null, firstEnqueuedRequest, server, null)
              .catch((error) => {
                console.error(`Error durante el reenvío directo de la petición ${request._id}. ${error}`.red);
              });
          } catch (error) {
            console.error(`Error durante el reenvío directo de la petición ${request._id}. ${error}`.red);
          }


        } else {
          console.log(`No se ha encontrado petición extraíble en la cola del servidor ${request.assignedServer}`.yellow);
        }
        
        resolve();

      })
      .catch((error) => {
        console.error(`Error en la comunicación con el servidor de renderizado ${request.assignedServer}. ${error}`.red);
        reject("No se ha podido llevar a cabo el proceso de renderizado");
      });

    if (res) {
      res.status(200).send({ requestId: request._id, requestStatus: "processing" });
    }
      
      
    // Solo tenemos acceso al tiempo restante estimado si estamos utilizando el motor Cycles
    if (request.parameters.engine === "CYCLES") {
      performPolling(request, server);
    }
  });
};





























const enqueueRequest = async (res, request, originalFilename) => {
  console.log(`Encolando petición ${request._id}...`.magenta);

  // Determinar a qué servidor encolar
  let totalEngineProcessedBytes = request.parameters.engine === "CYCLES" ? "totalCyclesProcessedBytes" : "totalEeveeProcessedBytes";
  let engineProcessedBytesPerMillisecondOfNeededTime = request.parameters.engine === "CYCLES" ? "cyclesProcessedBytesPerMillisecondOfNeededTime" : "eeveeProcessedBytesPerMillisecondOfNeededTime";
  let bestBusyServer = null;
  try {console.log("CONSULTA 1 ENCOLAR");
    // Buscar servidor en estado "busy" que no haya recibido peticiones 
    // aún con el mismo motor que la petición que hemos recibido (de los
    // posibles candidatos, seleccionar el que menos tiempo haya tardado
    // en llevar a cabo el renderizado de prueba)
    bestBusyServer = (await Server.findOneAndUpdate(
      { status: "busy", [totalEngineProcessedBytes]: 0 }, 
      { $set: { status: "busy" }, $inc: { enqueuedRequestsCount: 1 } }, 
      { sort: { timeSpentOnRenderTest: 1 } },
      { new: true } 
    ));
    
    if (!bestBusyServer) {console.log("CONSULTA 2 ENCOLAR");
      // Buscar servidor en estado "busy" con menos peticiones encoladas (de los
      // posibles candidatos, seleccionar el que mayor número de
      // B/ms tenga para el motor indicado en la peticion recibida)
      bestBusyServer = await Server.findOneAndUpdate(
        { status: "busy" },
        { $set: { status: "busy" }, $inc: { enqueuedRequestsCount: 1 } },
        { sort: { enqueuedRequestCount: 1, [engineProcessedBytesPerMillisecondOfNeededTime]: -1 } },
        { new: true } 
      );
        
    }

    
      
  } catch (error) {
    throw new Error(`Error al intentar determinar el mejor servidor al que encolar (Petición ${request._id}). ${error}`.red);
  }
    
  if (res) {
    res.status(200).send({ requestId: request._id, requestStatus: "enqueued" });
  }

  // O no hay ningún servidor registrado en el sistema, o todos se encuentran deshabilitados
    
  if (!bestBusyServer) {
    console.log(`No existe servidor al que se pueda encolar la petición ${request._id} en el sistema`.yellow);
  }

  // Persistir petición
  try {
    request.status = "enqueued";
    request.queueStartTime = new Date();
    request.assignedServer = bestBusyServer ? bestBusyServer.name : null;
    await request.save();
  } catch (error) {
    throw new Error(`Error interno al persistir la petición ${request._id} en la base de datos tras encolarla. ${error}`);
  }

  // Renombrar archivo temporal generado por multer utilizando el oid de MongoDB
  if (res) {
    try {
      renameSync(`./temp/${path.basename(originalFilename, path.extname(originalFilename))}${request.fileExtension}`, `./temp/${request._id}${request.fileExtension}`);
    } catch (error) {
      console.error(`Error al renombrar el archivo ${originalFilename} a ${request._id}${request.fileExtension}. ${error}`.red);
    }
  }
    
  // Si existe servidor
  if (bestBusyServer) {

    // Construir FormData
    const formData = new FormData();
    formData.append("requestId", request._id);
    try {
      const data = readFileSync(`./temp/${request._id}${request.fileExtension}`);
      formData.append("model", new Blob([data], { type: extensionToMimeType(request.fileExtension) }));
    } catch (error) {
      throw new Error(`Error en la lectura del fichero ${request._id}${request.fileExtension} antes de su envío previo al servidor de renderizado. ${error}`.red);
    }
   
    // Envío previo de fichero junto al id de la petición
    console.log(`Comenzando envío previo de fichero a ${bestBusyServer.name} (Petición ${request._id})...`.magenta);
    try {
      const beforeTransfer = new Date();
      const response = await fetch(
        `http://${bestBusyServer.ip}:${process.env.RENDER_SERVER_PORT}/file-transfer`,
        {
          method: "POST",
          body: formData
        }
      );
      
      if (response.ok) {
        const afterTransfer = new Date();
        const transferTimeMs = afterTransfer.getTime() - beforeTransfer.getTime();
        console.log(`Envío previo de fichero a ${bestBusyServer.name} realizado con éxito en ${transferTimeMs} ms (Petición ${request._id})`.magenta);
        request.sentFile = true;
        request.transferTime = transferTimeMs;
        await request.save();
      } else {
        throw new Error(`Código erróneo ${response.status} obtenido en la respuesta del servidor ${bestBusyServer.name} tras intentar el envío previo de fichero (Petición ${request._id}). ${(await response.json()).error}`);
      }
  
    } catch (error) {
      throw new Error(`Error durante el envío del fichero ${request._id}${request.fileExtension} a ${bestBusyServer.name}. ${error}`);
    }

  }

};









// Manejar la presencia de servidores disponibles enviándoles su próxima petición encolada,
// y asignar peticiones que no pudieron ser asignadas a ningñun servidor cuando se recibieron

const updateQueues = async () => {
  console.log("Comprobando servidores disponibles y colas...".yellow);
  // 1) Intentar enviar la próxima petición a los servidores disponibles que tengan peticiones encoladas

  // Consultar servidores disponibles
  let idleServersWithEnqueuedRequests = null;
  try {
    idleServersWithEnqueuedRequests = await Server.find({ status: "idle" });
  } catch (error)  {
    throw new Error(`Error al intentar consultar los servidores disponibles con peticiones encoladas. ${error}`);
  }

  // Si hay algún servidor disponible
  if (idleServersWithEnqueuedRequests && idleServersWithEnqueuedRequests.length > 0) {
    idleServersWithEnqueuedRequests.forEach(async (server) => {
      // Si tiene peticiones encoladas
      if (server.enqueuedRequestsCount > 0) {
        // Obtener primera petición de la cola correspondiente
        console.log("Encontrado servidor libre con encoladas".yellow)
        let firstEnqueuedRequest = null;
        try {
          firstEnqueuedRequest = await Request.findOne({ status: "enqueued", sentFile: true, assignedServer: server.name }).sort({ queueStartTime: 1 });
        } catch (error) {
          console.error(`Error al intentar consultar la primera petición encolada del servidor ${server.name}. ${error}`.red);
          return;
        }
  
        // Enviar la petición al servidor
        try {
          server = await Server.findByIdAndUpdate(
            server._id, 
            { status: "busy", $inc: { enqueuedRequestsCount: -1 } },
            { new: true }
          );
          forwardRequest(null, firstEnqueuedRequest, server, null)
            .catch((error) => {
              console.error(`Error durante el reenvío directo de la petición ${firstEnqueuedRequest._id}. ${error}`.red);
            });
        } catch (error) {
          console.error(`Error durante el reenvío directo de la petición ${firstEnqueuedRequest._id}. ${error}`);
          return;
        }
      }
    });
  }


  // 2) Intentar asignar servidor a las peticiones encoladas que no tengan ninguno aún

  // Consultar peticiones encoladas sin asignar
  let unassignedEnqueuedRequests = null;
  try {
    unassignedEnqueuedRequests = await Request.find({ status: "enqueued", assignedServer: null }).sort({ queueStartTime: 1 });
  } catch (error) {
    throw new Error(`Error al intentar consultar las peticiones encoladas no asignadas. ${error}`);
  }

  // Si existe alguna
  if (unassignedEnqueuedRequests && unassignedEnqueuedRequests.length > 0) {

    let newIdleServer = null;
    try {
      newIdleServer = (await Server.findOneAndUpdate(
        { status: "idle", enqueuedRequestsCount: 0 }, 
        { $set: { status: "busy" } },
        { new: true } 
      ));
    } catch (error) {
      throw new Error(`Error al intentar consultar el nuevo servidor disponible para asignar las peticiones encoladas sin asignar. ${error}`);
    }

    if (newIdleServer) {
      console.log("Encontrado servidor libre sin encoladas".yellow)

      // Enviar la primera directamente al servidor
      try {
        const request = unassignedEnqueuedRequests.shift();
        forwardRequest(null, request, newIdleServer, null)
          .catch((error) => {
            console.error(`Error durante el reenvío directo de la petición ${request._id}. ${error}`.red);
          });
      } catch (error) {
        console.error(`Error al intentar asignar las peticiones encoladas no asignadas al servidor ${newIdleServer.name}`);
      }
    } else {
      // Intentar encolar todas las que aún están sin asignar
      unassignedEnqueuedRequests.forEach((request) => {
        enqueueRequest(null, request, null);
      });
    }

  }

  console.log("Comprobando de servidores disponibles y colas finalizada".yellow);
};





































































const getWaitingInfo = async (req, res) => {
  try {
    // Consutar estado de la petición y el momento en que fue encolada y, en caso de que contara con ella, la estimación del tiempo restante
    const requestInfo = await Request.findById(req.params.requestId).select("queueStartTime assignedServer estimatedRemainingProcessingTime status").lean();

    let queuePosition = 0;
    let estimatedRemainingProcessingTime = requestInfo.estimatedRemainingProcessingTime;

    // Si la petición está encolada
    if (requestInfo.status === "enqueued") {
      // Obtener la posición a partir del número de peticiones 
      // actualmente encoladas al servidor asignado a la petición 
      // recibida que fueron encoladas antes
      queuePosition = (await Request.countDocuments({
        status: "enqueued",
        assignedServer: requestInfo.assignedServer,
        queueStartTime: { $lt: requestInfo.queueStartTime }
      })) + 1;

      // Obtener estimación de tiempo restante de la petición que se está procesando
      // más antigua que esté utilizando el motor Cycles en el servidor asignado, ya que con Eevee no tenemos
      // acceso al tiempo restante estimado de procesamiento
      estimatedRemainingProcessingTime = (
        await Request.findOne({
          status: "processing",
          assignedServer: requestInfo.assignedServer,
          estimatedRemianingProcessingTime: { $exists: true }
        })
          .sort({ processingStartTime: 1 }) // Ordenar en orden ascendente por "processingStartTime"
          .select("estimatedRemainingProcessingTime") // Seleccionar solo el campo "estimatedRemianingProcessingTime"
          .exec()
      )?.estimatedRemainingProcessingTime ?? null;
      
      console.log(
        "Tiempo restante ",
        estimatedRemainingProcessingTime,
        "(estaba enqueued)"
      );
    }

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
  // processQueue,
  updateQueues,
  getWaitingInfo,
  transferRenderedImage,
};