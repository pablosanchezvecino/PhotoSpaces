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
  try {
    Request.findByIdAndRemove(req.params.id, (error, deletedRequest) => {
      if (error) {
        console.error("Error al eliminar documento:", error);
      } else {
        console.error("Petición eliminada:", deletedRequest);
      }
    });
    res.status(200).send();
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error en la eliminación de la petición" });
  }
};

export { getRequests, deleteRequest };
