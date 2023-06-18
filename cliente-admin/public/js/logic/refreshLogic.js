import { addServerCard, addRequestCard } from "./cardLogic.js";
import { msToTime } from "./timeLogic.js";
import {
  administrationMicroserviceIp,
  administrationMicroservicePort
} from "../constants/addresses.js";
import {
  idleServerContainer,
  busyServerContainer,
  disabledServerContainer,
  processingRequestContainer,
  enqueuedRequestContainer,
  fulfilledRequestContainer,
  totalServerCountElement,
  idleServerCountElement,
  busyServerCountElement,
  disabledServerCountElement,
  totalRequestCountElement,
  processingRequestCountElement,
  enqueuedRequestCountElement,
  fulfilledRequestCountElement,
  averageRequestProcessingTimeElement,
  averageRequestQueueWaitingTimeElement,
} from "./DOMElements.js";

const refresh = async () => {

  let servers = null;
  let requests = null;
  let totalProcessingTime = 0;
  let totalQueueTime = 0;
  
  // Obtener servidores y peticiones
  try {
    const serversResponse = await fetch(`http://${administrationMicroserviceIp}:${administrationMicroservicePort}/servers`);
    servers = await serversResponse.json();

    const requestsResponse = await fetch(`http://${administrationMicroserviceIp}:${administrationMicroservicePort}/requests`);
    requests = await requestsResponse.json();

  } catch (error) {
    console.error(`Error en la consulta del estado del sistema. ${error}`);
    alert("Error en la consulta del estado del sistema");
    return;
  }

  // Borrar todas las tarjetas y textos informativos que se muestran si algún contenedor está vacío
  document.querySelectorAll(".server").forEach((e) => e.remove());
  document.querySelectorAll(".request").forEach((e) => e.remove());
  document.querySelectorAll(".empty-info").forEach((e) => e.remove());

  // Generar tarjetas servidores
  servers.forEach((server) => addServerCard(server));

  // Obtener número total de servidores y cuántos hay de cada tipo
  const totalServerCount = servers.length;
  const idleServerCount = idleServerContainer.childElementCount;
  const busyServerCount = busyServerContainer.childElementCount;
  const disabledServerCount = disabledServerContainer.childElementCount;
  
  // Mostrar información en la interfaz de usuario
  totalServerCountElement.innerText = totalServerCountElement.innerText.replace(/\d+$/, totalServerCount);
  idleServerCountElement.innerText = idleServerCountElement.innerText.replace(/\d+$/, idleServerCount);
  busyServerCountElement.innerText = busyServerCountElement.innerText.replace(/\d+$/, busyServerCount);
  disabledServerCountElement.innerText = disabledServerCountElement.innerText.replace(/\d+$/, disabledServerCount);
  
  // Mostrar texto informativo si no hay ningún servidor en algún estado
  if (idleServerCount === 0) {
    const emptyIdleServerContainerInfo = document.createElement("h4");
    emptyIdleServerContainerInfo.className = "text-secondary empty-info";
    emptyIdleServerContainerInfo.innerText = "No se encontraron servidores disponibles";
    idleServerContainer.appendChild(emptyIdleServerContainerInfo);
  }

  if (busyServerCount === 0) {
    const emptyBusyServerContainerInfo = document.createElement("h4");
    emptyBusyServerContainerInfo.className = "text-secondary empty-info";
    emptyBusyServerContainerInfo.innerText = "No se encontraron servidores ocupados";
    busyServerContainer.appendChild(emptyBusyServerContainerInfo);
  }
  
  if (disabledServerCount === 0) {
    const emptyDisabledServerContainerInfo = document.createElement("h4");
    emptyDisabledServerContainerInfo.className = "text-secondary empty-info";
    emptyDisabledServerContainerInfo.innerText = "No se encontraron servidores deshabilitados";
    disabledServerContainer.appendChild(emptyDisabledServerContainerInfo);
  }

  // Generar tarjetas peticiones
  // Utilizamos objeto para poder pasar por referencia e ir incrementando el valor
  let queuePosition = { position: 1 };
  requests.forEach((request) => {
    addRequestCard(request, queuePosition);
    
    // Acumular el tiempo que han pasado encoladas las peticiones en proceso y las finalizadas
    // Acumular el tiempo de procesamiento de las peticiones finalizadas
    if (request.status !== "enqueued") {
      // Si pasó tiempo en la cola, acumularlo
      if (request.queueStartTime) {
        totalQueueTime += (Date.parse(request.processingStartTime) - Date.parse(request.queueStartTime));
      }
      if (request.status === "fulfilled") {
        // Si ya ha sido procesada, acumular tiempo que ha tardado en ser procesada
        totalProcessingTime += (Date.parse(request.processingEndTime) - Date.parse(request.processingStartTime));
      }
    }
  });
  
  // Obtener número total de peticiones y cuántas hay de cada tipo
  const totalRequestCount = requests.length;
  const processingRequestCount = processingRequestContainer.childElementCount;
  const enqueuedRequestCount = enqueuedRequestContainer.childElementCount;
  const fulfilledRequestCount = fulfilledRequestContainer.childElementCount;

  // Mostrar información en la interfaz de usuario
  totalRequestCountElement.innerText = totalRequestCount;
  processingRequestCountElement.innerText = processingRequestCount;
  enqueuedRequestCountElement.innerText = enqueuedRequestCount;
  fulfilledRequestCountElement.innerText = fulfilledRequestCount;

  averageRequestProcessingTimeElement.innerText = totalProcessingTime === 0 ? "N/A" : msToTime(totalProcessingTime / fulfilledRequestCount);

  averageRequestQueueWaitingTimeElement.innerText = fulfilledRequestCount === 0 ? "N/A" : msToTime(totalQueueTime / (fulfilledRequestCount + processingRequestCount));

  // Mostrar texto informativo si no hay ninguna petición en algún estado
  if (processingRequestCount === 0) {
    const emptyProcessingRequestContainerInfo = document.createElement("h4");
    emptyProcessingRequestContainerInfo.className = "text-secondary empty-info";
    emptyProcessingRequestContainerInfo.innerText = "No se encontraron peticiones en proceso";
    processingRequestContainer.appendChild(emptyProcessingRequestContainerInfo);
  }

  if (enqueuedRequestCount === 0) {
    const emptyEnqueuedRequestContainerInfo = document.createElement("h4");
    emptyEnqueuedRequestContainerInfo.className = "text-secondary empty-info";
    emptyEnqueuedRequestContainerInfo.innerText = "No se encontraron peticiones encoladas";
    enqueuedRequestContainer.appendChild(emptyEnqueuedRequestContainerInfo);
  }
  
  if (fulfilledRequestCount === 0) {
    const emptyFulfilledRequestContainerInfo = document.createElement("h4");
    emptyFulfilledRequestContainerInfo.className = "text-secondary empty-info";
    emptyFulfilledRequestContainerInfo.innerText = "No se encontraron peticiones finalizadas";
    fulfilledRequestContainer.appendChild(emptyFulfilledRequestContainerInfo);
  }

};

export { refresh };
