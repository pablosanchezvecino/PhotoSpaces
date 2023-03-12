// Funciones asociadas a los endpoints relacionados con los cambios de estado del servidor

const ServerStates = require("../constants/serverStatesEnum.js");
const { currentStatus, setStatus, getStatus } = require("../serverStatus");

const disable = async (req, res) => {
  // Solo es posible deshabilitar el servidor si se encuentra en estado "idle"
  if (getStatus() === ServerStates.busy) {
    res
      .status(400)
      .send({ error: "El servidor se encuentra procesando una petición" });
    return;
  } else if (getStatus() === ServerStates.disabled) {
    res
      .status(400)
      .send({ error: "El servidor ya se encuentra deshabilitado" });
    return;
  }

  console.log("Deshabilitando servidor...");
  setStatus(ServerStates.disabled)
  res.status(200).send({ message: "Servidor deshabilitado con éxito" });
};

const enable = async (req, res) => {
  // Solo es posible habilitar el servidor si se encuentra en estado "disabled"
  if (getStatus() === ServerStates.busy) {
    res.status(400).send({
      error: "El servidor ya se encuentra habilitado y procesando una petición",
    });
    return;
  } else if (getStatus() === ServerStates.idle) {
    res.status(400).send({
      error:
        "El servidor ya se encuentra habilitado y a la espera de peticiones",
    });
    return;
  }

  console.log("Habilitando servidor...");
  setStatus(ServerStates.idle);
  res.status(200).send({ message: "Servidor habilitado con éxito" });
}

module.exports = {
  disable,
  enable
};
