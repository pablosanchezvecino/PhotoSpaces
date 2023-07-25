import { renderServerPort, renderServerPollingIntervalMs } from "../env.js";
import { wait } from "./timeLogic.js";

// Consultar periódicamente el tiempo restante estimado al servidor de renderizado
const performPolling = async (request, server) => {

  await wait(2000);

  let stop = false;
  while (!stop) {
    await wait(renderServerPollingIntervalMs);

    // console.log(`Consultando tiempo a servidor (Petición ${request._id}):`.green);
      
    try {
      const response = await fetch(`http://${server.ip}:${renderServerPort}/time`);
      if (response.ok) {
        const estimatedRemainingProcessingTimeMs = (await response.json()).estimatedRemainingProcessingTime;
        // console.log(`Obtenido ${estimatedRemainingProcessingTimeMs}`.green);
        request.estimatedRemainingProcessingTime = estimatedRemainingProcessingTimeMs;
        await request.save();
      } else {
        stop = true;
        console.error(`Obtenido código de respuesta ${response.status} al consultar el tiempo restante estimado del servidor de renderizado ${server.name}. ${(await response.json()).error}`.red);
      }
    } catch (error) {
      stop = true;
      console.error(`Error al intentar obtener tiempo restante estimado del servidor de renderizado ${server.name}. ${error}`.red);
    }
  }

};

export { performPolling };