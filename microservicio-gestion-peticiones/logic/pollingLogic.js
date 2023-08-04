import { renderServerPort, renderServerPollingIntervalMs } from "../env.js";
import { wait } from "./timeLogic.js";

// Consultar periódicamente el tiempo restante estimado al servidor de renderizado
const performPolling = async (request, server) => {

  let errorCount = 0;
  let stop = false;
  let previousRequest = null;
  const targetRequest = request._id.toString();

  while (!stop && errorCount <= 10) {

    await wait(renderServerPollingIntervalMs);

    try {

      const response = await fetch(`http://${server.ip}:${renderServerPort}/info`);

      if (response.ok) {

        const jsonContent = await response.json();
        const { estimatedRemainingProcessingTime, status, latestRequest } = jsonContent;

        if (latestRequest === targetRequest && status === "busy") {
          // Petición está siendo renderizada
          console.log(`Petición ${targetRequest} está siendo renderizada`);
          request.estimatedRemainingProcessingTime = estimatedRemainingProcessingTime;
          await request.save();
        } else if (latestRequest === targetRequest && status === "idle") {
          // Petición ha terminado de renderizarse
          console.log(`Petición ${targetRequest} ha terminado de renderizarse`);
          stop = true;
        } else if (latestRequest !== targetRequest && status === "busy") {
          // Petición ha terminado de renderizarse
          console.log(`Petición ${targetRequest} ha terminado de renderizarse`);
          stop = true;
        } else if (latestRequest !== targetRequest && status === "idle" && (previousRequest === null || previousRequest === latestRequest)) {
          // Petición todavía no ha empezado a renderizarse
          console.log(`Petición ${targetRequest} todavía no ha empezado a renderizarse`);
          previousRequest = latestRequest;
        } else { // Petición ha terminado de renderizarse
          console.log(`Petición ${targetRequest} ha terminado de renderizarse`);
          stop = true;
        }

      } else {
        console.error(`Obtenido código de respuesta ${response.status} al consultar el tiempo restante estimado del servidor de renderizado ${server.name}. ${(await response.json()).error}`.red);
        errorCount++;
      }
    } catch (error) {
      console.error(`Error al intentar obtener tiempo restante estimado del servidor de renderizado ${server.name}. ${error}`.red);
      errorCount++;
    }
  }

};

export { performPolling };