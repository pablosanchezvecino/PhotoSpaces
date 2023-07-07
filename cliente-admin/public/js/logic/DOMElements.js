// Declaraciones de elementos del DOM

// Modal
const confirmationModal = new bootstrap.Modal(document.getElementById("confirmation-modal"), {});
const confirmationModalConfirmationButton = document.getElementById("confirmation-button");
const confirmationModalReturnButton = document.getElementById("return-button");
const confirmationModalLabel = document.getElementById("confirmation-modal-label");
const confirmationModalBody = document.getElementById("confirmation-modal-body");

// Contenedores de las tarjetas de servidores
const idleServerContainer = document.getElementById("idle-server-container");
const busyServerContainer = document.getElementById("busy-server-container");
const disabledServerContainer = document.getElementById("disabled-server-container");

// Contenedores de las tarjetas de peticiones
const processingRequestContainer = document.getElementById("processing-request-container");
const enqueuedRequestContainer = document.getElementById("enqueued-request-container");
const fulfilledRequestContainer = document.getElementById("fulfilled-request-container");

// Estadísticas
const totalServerCountElement = document.getElementById("total-server-count");
const idleServerCountElement = document.getElementById("idle-server-count");
const busyServerCountElement = document.getElementById("busy-server-count");
const disabledServerCountElement = document.getElementById("disabled-server-count");
const totalRequestCountElement = document.getElementById("total-request-count");
const processingRequestCountElement = document.getElementById("processing-request-count");
const enqueuedRequestCountElement = document.getElementById("enqueued-request-count");
const fulfilledRequestCountElement = document.getElementById("fulfilled-request-count");

const averageRequestProcessingTimeElement = document.getElementById("average-request-processing-time");
const averageRequestQueueWaitingTimeElement = document.getElementById("average-request-queue-waiting-time");

// Inputs formulario
const ipInput = document.getElementById("ip-input");
const nameInput = document.getElementById("name-input");

export {
  confirmationModal,
  confirmationModalConfirmationButton,
  confirmationModalReturnButton,
  confirmationModalLabel,
  confirmationModalBody,
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
  ipInput,
  nameInput
};
