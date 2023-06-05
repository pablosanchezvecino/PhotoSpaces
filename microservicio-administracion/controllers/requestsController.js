// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

import Request from "../models/Request.js";

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({})
      .sort({
        queueStartTime: "asc",
      })
      .exec();

    res.status(200).send(requests);
  } catch (error) {
    console.error(`Error en la consulta a la base de datos. ${error}`.red);
    res.status(500).send({ error: "Error en la consulta a la base de datos" });
  }
};

const deleteRequest = async (req, res) => {
  // Eliminar petición de BD
  let deletedRequest = null;
  try {
    deletedRequest = await Request.findByIdAndRemove(req.params.id);
  } catch (error) {
    res.status(400).send({ error: "El parámetro id no es válido" });
    return;
  }

  // No se encuentra la petición
  if (!deletedRequest) {
    console.error(`Petición asociada al id ${req.params.id} no encontrada`.red);
    res.status(404).send({error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema"});
    return;
  }

  // Todo bien
  console.log(`Petición eliminada: ${deletedRequest}`);
  res.status(200).send(deletedRequest);
};

export { getRequests, deleteRequest };
