import { killBlenderOnWindows, killBlenderOnUnixBasedOs } from "../logic/killLogic.js";
import ServerStates from "../constants/serverStatesEnum.js";
import { setStatus, getStatus } from "../serverStatus.js";
import { performCleanup } from "../logic/cleanupLogic.js";

// Funciones asociadas a los endpoints relacionados con los cambios de estado del servidor

const disable = async (req, res) => {
  // Solo es posible deshabilitar el servidor si se encuentra en estado "idle"
  if (getStatus() === ServerStates.busy) {
    res.status(400).send({ error: "El servidor se encuentra procesando una petición" });
    return;
  } else if (getStatus() === ServerStates.disabled) {
    res.status(400).send({ error: "El servidor ya se encuentra deshabilitado" });
    return;
  }

  console.log("Deshabilitando servidor...".magenta);
  setStatus(ServerStates.disabled);
  res.status(200).send({ message: "Servidor deshabilitado con éxito" });
};

const enable = async (req, res) => {
  // Solo es posible habilitar el servidor si se encuentra en estado "disabled"
  if (getStatus() === ServerStates.busy) {
    res.status(400).send({ error: "El servidor ya se encuentra habilitado y procesando una petición" });
    return;
  } else if (getStatus() === ServerStates.idle) {
    res.status(400).send({ error: "El servidor ya se encuentra habilitado y a la espera de peticiones" });
    return;
  }

  console.log("Habilitando servidor...".magenta);
  setStatus(ServerStates.idle);
  res.status(200).send({ message: "Servidor habilitado con éxito" });
};

const unbind = async (req, res) => {
  // Solo es posible desvincular el servidor si no se encuentra en estado "busy"
  if (getStatus() === ServerStates.busy) {
    res.status(400).send({ error: "El servidor se encuentra procesando una petición" });
    return;
  } 

  console.log("Desvinculando servidor...".magenta);
  setStatus(ServerStates.unbound);
  res.status(200).send({ message: "Servidor desvinculado con éxito" });
};

const abort = async (req, res) => {
  // Solo es posible abortar el procesamiento del servidor si se encuentra en estado "busy"
  if (getStatus() !== ServerStates.busy) {
    res.status(400).send({ error: "El servidor no se encuentra procesando una petición" });
    return;
  } 

  console.log("Abortando procesamiento en el servidor...".magenta);

  try {

    if (process.platform === "win32") { // Windows
      await killBlenderOnWindows();
    } else { // Linux o MacOS
      await killBlenderOnUnixBasedOs();
    }

    performCleanup();
    console.log("Procesamiento en el servidor abortado con éxito".magenta);
    setStatus(ServerStates.idle);

    res.status(200).send({ message: "Procesamiento en el servidor abortado con éxito" });
  } catch (error) {
    console.error(`Error al intentar abortar el procesamiento en el servidor: ${error.message}`.red);
    res.status(500).send({ message: "Error interno al intentar abortar el procesamiento en el servidor" });
  }
  
};

export { disable, enable, unbind, abort };