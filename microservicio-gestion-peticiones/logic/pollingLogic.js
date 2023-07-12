import { wait } from "./timeLogic.js";

// Consultar periódicamente el tiempo restante estimado al servidor de renderizado
const performPolling = async (request, server) => {

  let errorCount = 0;

  await wait(2000);

  while (request.status !== "fulfilled" && errorCount <= 10) {

    await wait(process.env.RENDERING_SERVER_POLLING_INTERVAL_MS || 1000);

    // console.log(`Consultando tiempo a servidor (Petición ${request._id}):`.green);
      
    try {
      const response = await fetch(`http://${server.ip}:${process.env.RENDER_SERVER_PORT}/time`);
      if (response.ok) {
        const estimatedRemainingProcessingTimeMs = (await response.json()).estimatedRemainingProcessingTime;
        // console.log(`Obtenido ${estimatedRemainingProcessingTimeMs}`.green);
        request.estimatedRemainingProcessingTime = estimatedRemainingProcessingTimeMs;
        await request.save();
      } else {
        errorCount++;
        // console.error(`Obtenido código de respuesta ${response.status} al consultar el tiempo restante estimado del servidor de renderizado ${server.name}. ${(await response.json()).error}`.red);
      }
    } catch (error) {
      errorCount++;
      // console.error(`Error al intentar obtener tiempo restante estimado del servidor de renderizado ${server.name}. ${error}`.red);
    }
  }

};

export { performPolling };