import { showAddModal } from "./modalLogic.js";
import {
  confirmationModal,
  confirmationModalConfirmationButton,
  confirmationModalReturnButton,
  confirmationModalBody,
} from "./DOMElements.js";

// Intenta añadir el servidor correspondiente a la IP introducida en el formulario
const addServer = (serverIP, serverName) => {
  showAddModal();

  // Contactar con el microservicio de administración para que se encargue de añadir el nuevo servidor al sistema
  fetch("http://127.0.0.1:9000/servers", {
    method: "POST",
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ ip: serverIP, name: serverName }),
  })
    .then((response) => response.json())
    .then((jsonContent) => {
      // Espera adicional para que funcione bien modal
      setTimeout(() => {
        confirmationModal.hide();

        setTimeout(() => {
          if (jsonContent.error) {
            alert(jsonContent.error);
          } else {
            alert("Servidor añadido correctamente");
          }
        }, 200);
      }, 1000);

    })
    .catch((error) => {
      console.error(error);
    });
};

const enableServer = (serverId) => {
  confirmationModalReturnButton.style.display = "none";
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModalBody.innerHTML =
    "<div class=\"d-flex justify-content-center\"><div class=\"spinner-border text-secondary\" role=\"status\"><span class=\"visually-hidden\">Loading...</span></div></div>";

  fetch(`http://127.0.0.1:9000/servers/${serverId}/enable`, {
    method: "POST",
  })
    .then(async (response) => {
      confirmationModal.hide();
      setTimeout(async () => {
        if (response.status === 200) {
          alert((await response.json()).message);
        } else {
          alert((await response.json()).error);
        }
      }, 200);
    })
    .catch((error) => {
      console.error(error);
      setTimeout(() => {
        alert("Error: No se ha obtenido respuesta del servidor");
      }, 200);
    });
};

const disableServer = (serverId) => {
  confirmationModalReturnButton.style.display = "none";
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModalBody.innerHTML =
    "<div class=\"d-flex justify-content-center\"><div class=\"spinner-border text-secondary\" role=\"status\"><span class=\"visually-hidden\">Loading...</span></div></div>";

  fetch(`http://127.0.0.1:9000/servers/${serverId}/disable`, {
    method: "POST",
  })
    .then(async (response) => {
      confirmationModal.hide();
      setTimeout(async () => {
        if (response.status === 200) {
          alert((await response.json()).message);
        } else {
          alert((await response.json()).error);
        }
      }, 200);
    })
    .catch((error) => {
      console.error(error);
      setTimeout(() => {
        alert("Error: No se ha obtenido respuesta del servidor");
      }, 200);
    });
};

const abortServer = (serverId) => alert("Abortar " + serverId);

const deleteServer = (serverId) => {
  confirmationModalReturnButton.style.display = "none";
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModalBody.innerHTML =
    "<div class=\"d-flex justify-content-center\"><div class=\"spinner-border text-secondary\" role=\"status\"><span class=\"visually-hidden\">Loading...</span></div></div>";

  fetch(`http://127.0.0.1:9000/servers/${serverId}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      confirmationModal.hide();
      setTimeout(async () => {
        if (response.status === 200) {
          alert((await response.json()).message);
        } else {
          alert((await response.json()).error);
        }
      }, 200);
    })
    .catch((error) => {
      confirmationModal.hide();
      console.error(error);
      setTimeout(() => {
        alert("Error: No se ha obtenido respuesta del servidor");
      }, 200);
    });
};

export { addServer, enableServer, disableServer, abortServer, deleteServer };
