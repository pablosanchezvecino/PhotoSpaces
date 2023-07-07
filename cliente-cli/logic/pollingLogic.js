import { wait, msToTime } from "../logic/timeLogic.js";

// Consiltar al sistema  estado de la petición de forma periódica hasta que finalice
const requestPolling = async (requestId, requestStatus) => {
  console.log(`Petición recibida por el sistema (id = ${requestId}). Comenzando monitorización...`.bold.magenta);
  
  console.log(requestStatus === "processing" ? "Petición enviada a servidor\n".magenta : "Petición encolada\n".magenta);
  
  while (requestStatus !== "fulfilled") {
  
    await wait(process.env.POLLING_INTERVAL_MS);
  
    try {
      const response = await fetch(
        `http://${process.env.REQUEST_HANDLING_MICROSERVICE_IP}:${process.env.REQUEST_HANDLING_MICROSERVICE_PORT}/requests/${requestId}/info`,
        { method: "GET" }
      );
    
      if (response.ok) {
        const jsonContent = await response.json();
        requestStatus = jsonContent.requestStatus;
          
        if (requestStatus === "enqueued") {
          console.log(`Petición encolada\nPosición en la cola: ${jsonContent.requestQueuePosition}\nTiempo estimado para avance en la cola: ${msToTime(jsonContent.processingRequestEstimatedRemainingProcessingTime)}\n`.yellow);
        } else if (requestStatus === "processing") {
          const time = (
            jsonContent.processingRequestEstimatedRemainingProcessingTime !== null && 
            jsonContent.processingRequestEstimatedRemainingProcessingTime !== undefined
          ) ? 
            msToTime(jsonContent.processingRequestEstimatedRemainingProcessingTime) 
            : 
            "N/A";
  
          console.log(`Petición enviada a servidor\nTiempo restante estimado: ${time}\n`.green);
  
        } else {
          console.log("Petición finalizada".cyan);
        }
          
      } else {
        console.error(`Código de respuesta erróneo devuelto por el sistema. ${(await response.json()).error}`.red);
      }
  
    } catch (error) {
      console.error(`Error al consultar el estado de la petición. ${error}`.red);
    }
  
  }
  
};

export { requestPolling };