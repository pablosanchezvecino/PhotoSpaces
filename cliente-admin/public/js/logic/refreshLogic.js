import { administrationMicroserviceUrl, maxCardsPerContainer } from "../constants/parameters.js";
import { addServerCard, addRequestCard } from "./cardLogic.js";
import { refreshPeriodMs } from "../constants/parameters.js";
import { msToTime } from "./conversionsLogic.js";
import { wait } from "./timeLogic.js";
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
  averageRequestQueueWaitingTimeElement
} from "./DOMElements.js";

let stop = false;

const refresh = async () => {

  let servers = null;
  let requests = null;
  let totalProcessingTime = 0;
  let totalQueueTime = 0;
  
  // Guardar estado de los scrolls para restablecerlos tras refrescar
  const idleServerContainerScroll = idleServerContainer.scrollLeft;
  const busyServerContainerScroll = busyServerContainer.scrollLeft;
  const disabledServerContainerScroll = disabledServerContainer.scrollLeft;
  const processingRequestContainerScroll = processingRequestContainer.scrollLeft;
  const enqueuedRequestContainerScroll = enqueuedRequestContainer.scrollLeft;
  const fulfilledRequestContainerScroll = fulfilledRequestContainer.scrollLeft;
  
  const queryString = maxCardsPerContainer ? `?limit=${maxCardsPerContainer}` : "";
  
  // Obtener servidores y peticiones
  try {
    const serversResponse = await fetch(`${administrationMicroserviceUrl}/servers${queryString}`);
    if (serversResponse.ok) {
      servers = await serversResponse.json();
    } else {
      throw new Error(`Obtenido código ${serversResponse.status} en la consulta de servidores`);
    }
      
    const requestsResponse = await fetch(`${administrationMicroserviceUrl}/requests${queryString}`);
    if (requestsResponse.ok) {
      requests = await requestsResponse.json();
    } else {
      throw new Error(`Obtenido código ${requestsResponse.status} en la consulta de peticiones`);
    }
    
  } catch (error) {
    stop = true;
    console.error(`Error en la consulta del estado del sistema. ${error}`);
    alert("Error en la consulta del estado del sistema. Pruebe a recargar la página");
    return;
  }
  
  // Borrar todas las tarjetas y textos informativos que se muestran si algún contenedor está vacío
  document.querySelectorAll(".server").forEach((e) => e.className="server-remove");
  document.querySelectorAll(".request").forEach((e) => e.className="request-remove");
  // document.querySelectorAll(".empty-info").forEach((e) => e.className="remove");
  
  // Generar tarjetas servidores
  servers.forEach((server) => addServerCard(server));
  document.querySelectorAll(".server-remove").forEach((e) => e.remove());
  
  
  idleServerContainer.scrollLeft = idleServerContainerScroll;
  busyServerContainer.scrollLeft = busyServerContainerScroll;
  disabledServerContainer.scrollLeft = disabledServerContainerScroll;
  
  // Obtener número total de servidores y cuántos hay de cada tipo
  const totalServerCount = servers.length;
  const idleServerCount = servers.filter(server => server.status === "idle").length;
  const busyServerCount = servers.filter(server => server.status === "busy").length;
  const disabledServerCount = servers.filter(server => server.status === "disabled").length;
  
  // Mostrar información en la interfaz de usuario
  totalServerCountElement.innerText = totalServerCountElement.innerText.replace(/\d+$/, totalServerCount);
  idleServerCountElement.innerText = idleServerCountElement.innerText.replace(/\d+$/, idleServerCount);
  busyServerCountElement.innerText = busyServerCountElement.innerText.replace(/\d+$/, busyServerCount);
  disabledServerCountElement.innerText = disabledServerCountElement.innerText.replace(/\d+$/, disabledServerCount);
  
  // Mostrar texto informativo si no hay ningún servidor en algún estado
  let emptyIdleServerContainerInfo = document.getElementById("idle-server-container-empty-info");
  if (idleServerCount === 0 && !emptyIdleServerContainerInfo) {
    const emptyIdleServerContainerInfo = document.createElement("h4");
    emptyIdleServerContainerInfo.id = "idle-server-container-empty-info";
    emptyIdleServerContainerInfo.className = "text-secondary empty-info";
    emptyIdleServerContainerInfo.innerText = "No se encontraron servidores disponibles";
    idleServerContainer.appendChild(emptyIdleServerContainerInfo);
  } else if (idleServerCount > 0 && emptyIdleServerContainerInfo) {
    emptyIdleServerContainerInfo.remove();
  }

  let emptyBusyServerContainerInfo = document.getElementById("busy-server-container-empty-info");
  if (busyServerCount === 0 && !emptyBusyServerContainerInfo) {
    emptyBusyServerContainerInfo = document.createElement("h4");
    emptyBusyServerContainerInfo.id = "busy-server-container-empty-info";
    emptyBusyServerContainerInfo.className = "text-secondary empty-info";
    emptyBusyServerContainerInfo.innerText = "No se encontraron servidores ocupados";
    busyServerContainer.appendChild(emptyBusyServerContainerInfo);
  } else if (busyServerCount > 0 && emptyBusyServerContainerInfo) {
    emptyBusyServerContainerInfo.remove();
  }
  
  let emptyDisabledServerContainerInfo = document.getElementById("disabled-server-container-empty-info");
  if (disabledServerCount === 0 && !emptyDisabledServerContainerInfo) {
    emptyDisabledServerContainerInfo = document.createElement("h4");
    emptyDisabledServerContainerInfo.id = "disabled-server-container-empty-info";
    emptyDisabledServerContainerInfo.className = "text-secondary empty-info";
    emptyDisabledServerContainerInfo.innerText = "No se encontraron servidores deshabilitados";
    disabledServerContainer.appendChild(emptyDisabledServerContainerInfo);
  } else if (disabledServerCount > 0 && emptyDisabledServerContainerInfo) {
    emptyDisabledServerContainerInfo.remove();
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
  document.querySelectorAll(".request-remove").forEach((e) => e.remove());
  
  
  processingRequestContainer.scrollLeft = processingRequestContainerScroll;
  enqueuedRequestContainer.scrollLeft = enqueuedRequestContainerScroll;
  fulfilledRequestContainer.scrollLeft = fulfilledRequestContainerScroll;
  
  // Obtener número total de peticiones y cuántas hay de cada tipo
  const totalRequestCount = requests.length;
  const processingRequestCount = requests.filter(request => request.status === "processing").length;
  const enqueuedRequestCount = requests.filter(request => request.status === "enqueued").length;
  const fulfilledRequestCount = requests.filter(request => request.status === "fulfilled").length;
  
  // Mostrar información en la interfaz de usuario
  totalRequestCountElement.innerText = totalRequestCount;
  processingRequestCountElement.innerText = processingRequestCount;
  enqueuedRequestCountElement.innerText = enqueuedRequestCount;
  fulfilledRequestCountElement.innerText = fulfilledRequestCount;
  
  averageRequestProcessingTimeElement.innerText = totalProcessingTime === 0 ? "N/A" : msToTime(totalProcessingTime / fulfilledRequestCount);

  averageRequestQueueWaitingTimeElement.innerText = fulfilledRequestCount === 0 ? "N/A" : msToTime(totalQueueTime / (fulfilledRequestCount + processingRequestCount));
  
  // Mostrar texto informativo si no hay ninguna petición en algún estado
  let emptyProcessingRequestContainerInfo = document.getElementById("processing-request-container-empty-info");
  if (processingRequestCount === 0 && !emptyProcessingRequestContainerInfo) {
    emptyProcessingRequestContainerInfo = document.createElement("h4");
    emptyProcessingRequestContainerInfo.id = "processing-request-container-empty-info";
    emptyProcessingRequestContainerInfo.className = "text-secondary empty-info";
    emptyProcessingRequestContainerInfo.innerText = "No se encontraron peticiones en proceso";
    processingRequestContainer.appendChild(emptyProcessingRequestContainerInfo);
  } else if (processingRequestCount > 0 && emptyProcessingRequestContainerInfo) {
    emptyProcessingRequestContainerInfo.remove();
  }
  
  let emptyEnqueuedRequestContainerInfo = document.getElementById("enqueued-request-container-empty-info");
  if (enqueuedRequestCount === 0 && !emptyEnqueuedRequestContainerInfo) {
    emptyEnqueuedRequestContainerInfo = document.createElement("h4");
    emptyEnqueuedRequestContainerInfo.id = "enqueued-request-container-empty-info";
    emptyEnqueuedRequestContainerInfo.className = "text-secondary empty-info";
    emptyEnqueuedRequestContainerInfo.innerText = "No se encontraron peticiones encoladas";
    enqueuedRequestContainer.appendChild(emptyEnqueuedRequestContainerInfo);
  } else if (enqueuedRequestCount > 0 && emptyEnqueuedRequestContainerInfo) {
    emptyEnqueuedRequestContainerInfo.remove();
  }
  
  let emptyFulfilledRequestContainerInfo = document.getElementById("fulfilled-request-container-empty-info");
  if (fulfilledRequestCount === 0 && !emptyFulfilledRequestContainerInfo) {
    emptyFulfilledRequestContainerInfo = document.createElement("h4");
    emptyFulfilledRequestContainerInfo.id = "fulfilled-request-container-empty-info";
    emptyFulfilledRequestContainerInfo.className = "text-secondary empty-info";
    emptyFulfilledRequestContainerInfo.innerText = "No se encontraron peticiones finalizadas";
    fulfilledRequestContainer.appendChild(emptyFulfilledRequestContainerInfo);
  } else if (fulfilledRequestCount > 0 && emptyFulfilledRequestContainerInfo) {
    emptyFulfilledRequestContainerInfo.remove();
  }


};

const setUpRefreshInterval = async () => {
  while (!stop) {
    refresh();
    await wait(refreshPeriodMs);
  }
};
export { setUpRefreshInterval };
