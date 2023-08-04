import { renderServerPort, requestHandlingMicroserviceUrl } from "../env.js";
import { options } from "../constants/sendRenderedImageOptions.js";
import { unlinkSync } from "fs";
import Request from "../models/Request.js";
import Server from "../models/Server.js";
import mongoose from "mongoose";

// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

const getRequests = async (req, res) => {
  try {
    let limit = req.query.limit;

    // Si no se ha indicado límite o no es un entero
    if (!limit || limit.includes(".") || isNaN(parseInt(limit))) {
      // 0 indica a mongoose que no limite el número de documentos devueltos
      limit = 0; 
    }

    let requests = null;
    if (limit === 0) { // Sin límite
      requests = await Request.find({}).sort({ queueStartTime: 1 });
    } else { // Consulta limitada por cada estado posible
      const processingRequests = await Request.find({ status: "processing" }).sort({ processingStartTime: -1 }).limit(limit);
      const enqueuedRequests = await Request.find({ status: "enqueued" }).sort({ queueStartTime: 1 }).limit(limit);
      const fulfilledRequests = await Request.find({ status: "fulfilled" }).sort({ processingEndTime: -1 }).limit(limit);

      requests = processingRequests.concat(enqueuedRequests, fulfilledRequests);
    }

    res.status(200).send(requests);
  } catch (error) {
    console.error(`Error en la consulta de las peticiones a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en la consulta de las peticiones a la base de datos" });
  }
};

const getRequestById = async (req, res) => {
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
    console.error(`Error en la consulta de la petición a la base de datos. ${error}`.red);
    res.status(400).send({ error: "Error en la consulta de la petición a la base de datos" });
    return;
  }

  // No se encuentra el servidor
  if (!request) {
    console.error(`Petición de renderizado asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({ error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema" });
    return;
  }

  // Todo bien
  res.status(200).send(request);
};

const getRequestRenderedImage = async (req, res) => {

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
    console.error(`Error en la consulta previa de la petición a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en en la consulta previa de la petición a la base de datos" });
    return;
  }

  // No se encuentra la petición
  if (!request) {
    console.error(`Petición de renderizado asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({ error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema" });
    return;
  }

  // Petición existe pero no ha sido finalizada
  if (request.status !== "fulfilled") {
    console.error(`La petición de renderizado ${req.params.id} no ha sido procesada aún`.red);
    res.status(400).send({ error: "El parámetro id se corresponde con una petición de renderizado cuyo procesamiento no ha finalizado aún" });
    return;
  }

  // Enviar imagen renderizada para que el navegador pueda descargarla
  res.status(200).sendFile(`./temp/${req.params.id}.png`, options);
};

// Aunque se produzcan errores, se seguirá intentando eliminar la petición
// para evitar posibles situaciones de bloqueo
const deleteRequest = async (req, res) => {
  // Oid no válido
  if (!mongoose.isValidObjectId(req.params.id)) {
    console.error(`Recibido parámetro id no válido (${req.params.id})`.red);
    res.status(400).send({ error: "El parámetro id no es válido" });
    return;
  }
  
  // Consultar petición en BD
  let requestToDelete = null;
  try {
    requestToDelete = await Request.findById(req.params.id);
  } catch (error) {
    console.error(`Error en la consulta de la petición a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en la consulta de la petición a la base de datos" });
    return;
  }

  // No se encuentra la petición
  if (!requestToDelete) {
    console.error(`Petición de renderizado asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({ error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema"});
    return;
  }
  
  // Si está siendo procesada en un servidor, abortar el procesamiento en este
  let notifyRequestHandlingMicroservice = false;
  if (requestToDelete.status === "processing") {
    // Consultar el servidor que está procesando la petición
    let server = null;
    try {
      server = await Server.findOne({ name: requestToDelete.assignedServer });
    } catch (error) {
      console.error(`Error en las consultas a la base de datos previas a abortar el procesamiento en el servidor. ${error}`.red);
      res.status(500).send({ error: "Error en las consultas a la base de datos previas a abortar el procesamiento en el servidor" });
      return;
    }

    // Contactar con el servidor
    if (server) {
      try {
        const response = await fetch(`http://${server.ip}:${renderServerPort}/abort`, 
          { method: "POST" }
        );
  
        // Si todo fue bien
        if (response.ok) {
          // Actualizar estado en BD
          try {
            await Server.findByIdAndUpdate(server._id, { status: "idle" });
            notifyRequestHandlingMicroservice = true;
          } catch (error) {
            console.error(`Error interno en la conexión con la base de datos tras abortar el procesamiento en el servidor. ${error}`.red);
          }
        } else {
          console.error(`Obtenido código ${response.status} en la respuesta del servidor`.red);
        }
  
      } catch (error) {
        console.error(`Error en la conexión con el servidor de renderizado. ${error}`.red);
      }
    }
    
  } else if (requestToDelete.status === "enqueued" && requestToDelete.assignedServer !== null) {
    // Si estaba encolada y tenía servidor asignado, 
    // decrementar el número de peticiones encoladas del servidor
    try {
      await Server.findOneAndUpdate(
        { name: requestToDelete.assignedServer }, 
        { $inc: { enqueuedRequestsCount: -1} });
    } catch (error) {
      console.error(`Error al intentar decrementar el número de peticiones encoladas del servidor ${requestToDelete.assignedServer}. ${error}`.red);
    }
  }
  
  // Eliminar petición
  let deletedRequest = null;
  try {
    deletedRequest = await Request.findByIdAndRemove(req.params.id);
  } catch (error) {
    console.error(`Error durante el borrado de la petición a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error durante el borrado de la petición a la base de datos" });
  }

  if (notifyRequestHandlingMicroservice) {
    // Avisar al microservicio de gestión de peticiones de que hay un nuevo servidor disponible
    try {
      await fetch(`${requestHandlingMicroserviceUrl}/new-server-available`,
        { method: "POST" }
      );
    } catch (error) {
      console.error(`Error al intentar contactar con el microservicio de gestión de peticiones. ${error}`.red);
    }
  }

  if (deletedRequest.status === "fulfilled") {
    // Eliminar imagen asociada del directorio temp
    try {
      unlinkSync(`./temp/${req.params.id}.png`);
    } catch (error) {
      console.error(`Error al eliminar el archivo ${req.params.id}.png. ${error}`.red);
    }
  }

  // Todo bien
  res.status(200).send(deletedRequest);
};

const handleReceivedImage = async (req, res) => {
  console.log(`Recibido fichero ${req.file.filename}`.magenta);

  // Oid no válido
  if (!mongoose.isValidObjectId(req.params.id)) {
    console.error(`Recibido parámetro id no válido (${req.params.id})`.red);
    res.status(400).send({ error: "El parámetro id no es válido" });
    try {
      unlinkSync(`./temp/${req.params.id}.png`);
    } catch (error) {
      console.error(`Error al eliminar el archivo ${req.params.id}.png. ${error}`.red);
    }
    return;
  }
  
  // Consultar petición en BD
  let request = null;
  try {
    request = await Request.findById(req.params.id);
  } catch (error) {
    console.error(`Error en la consulta de la petición a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en la consulta de la petición a la base de datos" });
    try {
      unlinkSync(`./temp/${req.params.id}.png`);
    } catch (error) {
      console.error(`Error al eliminar el archivo ${req.params.id}.png. ${error}`.red);
    }
    return;
  }

  // No se encuentra la petición
  if (!request) {
    console.error(`Petición de renderizado asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({ error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema" });
    try {
      unlinkSync(`./temp/${req.params.id}.png`);
    } catch (error) {
      console.error(`Error al eliminar el archivo ${req.params.id}.png. ${error}`.red);
    }
    return;
  }

  // Todo bien
  res.status(200).send({ message: "Fichero recibido con éxito" });
};

export { getRequests, getRequestById, getRequestRenderedImage, deleteRequest, handleReceivedImage };