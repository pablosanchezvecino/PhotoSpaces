import Request from "../models/Request.js";
import mongoose from "mongoose";

// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({}).sort({ queueStartTime: "asc" });
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
  
  // Eliminar petición de BD
  let deletedRequest = null;
  try {
    deletedRequest = await Request.findByIdAndRemove(req.params.id);
  } catch (error) {
    console.error(`Error en el borrado en la base de datos. ${error}`.red);
    res.status(400).send({ error: "Error en el borrado en la base de datos" });
    return;
  }

  // No se encuentra la petición
  if (!deletedRequest) {
    console.error(`Petición de renderizado asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema"});
    return;
  }

  // Todo bien
  console.log(`Petición eliminada: ${deletedRequest}`.magenta);
  res.status(200).send(deletedRequest);
};

export { getRequests, getRequestById, deleteRequest };