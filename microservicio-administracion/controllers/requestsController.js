import Request from "../models/Request.js";
import Server from "../models/Server.js";
import mongoose from "mongoose";

// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

const getRequests = async (req, res) => {
  try {
    let limit = req.query.limit;

    // Si no se ha indicado límite o no es un entero
    if (!limit || limit.includes(".") || isNaN(parseInt(limit))) {
      // 0 indica a mongoose que no limite el nñumero de documentos deueltos
      limit = 0; 
    }

    const requests = await Request.find({}).sort({ queueStartTime: "asc" }).limit(limit);

    res.status(200).send(requests);
  } catch (error) {
    console.error(`Error en la consulta a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en la consulta a la base de datos" });
  }
};

const getRequestById = async (req, res) => {
  // Oid no válido
  if (!mongoose.isValidObjectId(req.params.id)) {
    console.error(`Recibido parámetro id no válido (${req.params.id})`.red);
    res.status(400).send({ error: "El parámetro id no es válido" });
    return;
  }
  
  // Buscar servidor en BD
  let request = null;
  try {
    request = await Request.findById(req.params.id);
  } catch (error) {
    console.error(`Error en la consulta en la base de datos. ${error}`.red);
    res.status(400).send({ error: "Error en en la consulta en la base de datos" });
    return;
  }

  // No se encuentra el servidor
  if (!request) {
    console.error(`Petición de renderizado asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema"});
    return;
  }

  // Todo bien
  res.status(200).send(request);
};

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
    console.error(`Error en la consulta a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en la consulta a la base de datos" });
    return;
  }

  // No se encuentra la petición
  if (!requestToDelete) {
    console.error(`Petición de renderizado asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema"});
    return;
  }
  
  // Si está siendo procesada en un servidor, abortar el procesamiento en este
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
    try {
      const response = await fetch(`http://${server.ip}:${process.env.RENDER_SERVER_PORT}/abort`, {
        method: "POST",
        headers: {
          Accept: "application/json"
        }
      });

      if (response.ok) {
      // Si todo fue bien
      // Actualizar estado en BD
        try {
          await Server.findByIdAndUpdate(server._id, { status: "idle" });
        } catch (error) {
          console.error(`Error interno en la conexión con la base de datos tras abortar el procesamiento en el servidor. ${error}`.red);
          res.status(500).send({ error: "Error interno en la conexión con la base de datos tras abortar el procesamiento en el servidor" });
          return;
        }
      } else {
        throw new Error(`Obtenido código ${response.status} en la respuesta del servidor`);
      }

    } catch (error) {
      console.error(`Error en la conexión con el servidor de renderizado. ${error}`.red);
      res.status(500).send({ error: "Error en la conexión con el servidor de renderizado" });
      return;
    }
    
  }
  
  let deletedRequest = null;
  try {
    deletedRequest = await Request.findByIdAndRemove(req.params.id);
  } catch (error) {
    console.error(`Error durante el borrado de la petición en la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error durante el borrado de la petición en la base de datos" });
  }
  // Todo bien
  res.status(200).send(deletedRequest);
};

export { getRequests, getRequestById, deleteRequest };