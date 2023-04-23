import {
  confirmationModal,
  confirmationModalConfirmationButton,
  confirmationModalReturnButton,
  confirmationModalBody,
} from "./DOMElements.js";
import {
  serverAdministrationMicroserviceIp,
  serverAdministrationMicroservicePort,
} from "../constants/addresses.js";

const deleteRequest = (requestId) => {
  confirmationModalReturnButton.style.display = "none";
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModalBody.innerHTML =
    "<div class=\"d-flex justify-content-center\"><div class=\"spinner-border text-secondary\" role=\"status\"><span class=\"visually-hidden\">Loading...</span></div></div>";

  fetch(`http://${serverAdministrationMicroserviceIp}:${serverAdministrationMicroservicePort}/requests/${requestId}`, {
    method: "DELETE",
  })
    .then(async (response) => {
      confirmationModal.hide();
      setTimeout(async () => {console.log(response.status);
        if (response.status === 200) {
          alert("Petición eliminada con éxito");
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

export { deleteRequest };
