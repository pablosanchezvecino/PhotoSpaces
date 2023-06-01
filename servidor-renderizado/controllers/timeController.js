// Función asociada al endpoint que devuelve el tiempo restante estimado del proceso de renderizado

import ServerStates from "../constants/serverStatesEnum.js";
import { getStatus } from "../serverStatus.js";
import  { getEstimatedRemainingProcessingTime } from "../serverStatus.js";

const handleEstimatedRemainingProcessingTimeRequest = async (req, res) => {
  // Solo es posible deshabilitar el servidor si se encuentra en estado "busy"
  if (getStatus() !== ServerStates.busy) {
    res
      .status(400)
      .send({ error: "El servidor no se encuentra procesando una petición" });
    return;
  }

  console.log(`Devolviendo ${getEstimatedRemainingProcessingTime()}`.magenta);
  res.status(200).send({ estimatedRemainingProcessingTime: getEstimatedRemainingProcessingTime()});
};

export { handleEstimatedRemainingProcessingTimeRequest };
