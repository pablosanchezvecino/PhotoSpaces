// Funciones asociadas a los endpoints relacionados con la administración de las peticiones de renderizado

const Request = require("../models/Request");
const Server = require("../models/Server");

const handleNewRequest = async (req, res) => {

  const parameters = JSON.parse(req.body.data);

  // Buscar servidor en estado "idle"
  const idleServers = await Server.find({ status: "idle" });
  // Comprobar la cola
  const queue = await Request.find({ status: "enqueued" });

  // Obtener dirección IP del cliente
  const ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;

  // Creamos nueva petición de renderizado
  const newRequest = new Request({
    clientIp: ip,
    parameters: parameters
  });

  // La cola está vacía y hay al menos un servidor en estado "idle"
  if (/*queue.length === 0 &&*/ idleServers.length > 0) {
    // Enviar petición al servidor disponible más adecuado
    console.log(`Reenviando petición a ${idleServers[0].name}...`.magenta);
    // TODO: Enviar petición a servidor de renderizado
    newRequest.status = "processing";
    newRequest.assignedServer = idleServers[0].name;
    newRequest.processingStartTime = new Date();
  } else {
    // Hay peticiones por delante en la cola o la cola está vacía pero todos los servidores están ocupados
    console.log("Encolando petición...".magenta);
    // TODO: Encolar petición
    newRequest.status = "enqueued";
    newRequest.queuePosition = 1;
    newRequest.queueStartTime = new Date();
  }
  newRequest.save();
};

module.exports = {
  handleNewRequest,
};
