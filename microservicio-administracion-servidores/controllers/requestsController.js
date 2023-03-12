// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

const Request = require("../models/Request");

const getRequests = async (req, res) => {
  try {
    const requests = await Request.find({});
    res.status(200).send(requests);
  } catch (error) {
    console.error(error);
    res.status(500).send({ error: "Error en la consulta a la base de datos" });
  }
};

module.exports = {
  getRequests,
};
