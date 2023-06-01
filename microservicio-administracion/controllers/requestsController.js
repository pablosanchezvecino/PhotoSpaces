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
    console.error(error);
    res.status(500).send({ error: "Error en la consulta a la base de datos" });
  }
};

const deleteRequest = async (req, res) => {
  Request.findByIdAndRemove(req.params.id, (error, deletedRequest) => {
    if (error) { // Id no válido
      console.error("Error al eliminar documento:", error);
      res.status(404).send({error: "El parámetro id no es válido"});
    } else {
      if (deletedRequest !== null) { // Se borra bien la petición
        console.log("Petición eliminada:", deletedRequest);
        res.status(200).send(deletedRequest);
      } else { // No se ha borrado nada porque no existía documento asociado a ese id
        console.error(`Petición asociada al id ${req.params.id} no encontrada`);
        res.status(404).send({error: "El parámetro id no se corresponde con ninguna petición de renderizado almacenada en el sistema"});
      }
    }
  });
};

export { getRequests, deleteRequest };
