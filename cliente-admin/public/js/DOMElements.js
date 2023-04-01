// Declaraciones de elementos del DOM

// Modal
export const confirmationModal = new bootstrap.Modal(
  document.getElementById("confirmation-modal"),
  {}
);
export const confirmationModalConfirmationButton = document.getElementById(
  "confirmation-button"
);
export const confirmationModalReturnButton = document.getElementById("return-button");
export const confirmationModalLabel = document.getElementById(
  "confirmation-modal-label"
);
export const confirmationModalBody = document.getElementById(
  "confirmation-modal-body"
);

// Contenedores de las tarjetas de servidores
export const idleServerContainer = document.getElementById("idle-server-container");
export const busyServerContainer = document.getElementById("busy-server-container");
export const disabledServerContainer = document.getElementById(
  "disabled-server-container"
);

// Contenedores de las tarjetas de peticiones
export const processingRequestContainer = document.getElementById(
  "processing-request-container"
);
export const enqueuedRequestContainer = document.getElementById(
  "enqueued-request-container"
);
export const fulfilledRequestContainer = document.getElementById(
  "fulfilled-request-container"
);

// Estadísticas
export const totalServerCountElement = document.getElementById("total-server-count");
export const idleServerCountElement = document.getElementById("idle-server-count");
export const busyServerCountElement = document.getElementById("busy-server-count");
export const disabledServerCountElement = document.getElementById(
  "disabled-server-count"
);
export const totalRequestCountElement = document.getElementById("total-request-count");
export const processingRequestCountElement = document.getElementById(
  "processing-request-count"
);
export const enqueuedRequestCountElement = document.getElementById(
  "enqueued-request-count"
);
export const fulfilledRequestCountElement = document.getElementById(
  "fulfilled-request-count"
);

export const averageRequestProcessingTimeElement = document.getElementById(
  "average-request-processing-time"
);
export const averageRequestQueueWaitingTimeElement = document.getElementById(
  "average-request-queue-waiting-time"
);

// Inputs formulario
export const ipInput = document.getElementById("ipInput");
export const nameInput = document.getElementById("nameInput");
