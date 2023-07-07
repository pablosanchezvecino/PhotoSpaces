import {
  administrationMicroserviceIp,
  administrationMicroservicePort,
} from "../constants/parameters.js";
import {
  confirmationModal,
  confirmationModalConfirmationButton,
  confirmationModalReturnButton,
  confirmationModalBody,
} from "./DOMElements.js";
import { spinnerHtml } from "../constants/spinnerHtml.js";

const deleteRequest = async (requestId) => {
  confirmationModalReturnButton.style.display = "none";
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModalBody.innerHTML = spinnerHtml;

  try {
    const response = await fetch(`http://${administrationMicroserviceIp}:${administrationMicroservicePort}/requests/${requestId}`, { method: "DELETE" });

    const jsonContent = await response.json();
    
    let alertContent = null;
    if (response.ok) {
      alertContent = "Petición eliminada con éxito";
    } else {
      alertContent = jsonContent.error;
    }

    // Espera adicional para que funcione bien modal
    setTimeout(() => {
      confirmationModal.hide();
      setTimeout(() => alert(alertContent), 200);
    }, 1000);

  } catch (error) {
    console.error(`Error en la conexión con el microservicio de administración. ${error}`);
    setTimeout(() => {
      confirmationModal.hide();
      setTimeout(() => alert("Error en la conexión con el microservicio de administración"), 200);
    }, 1000);
  }
  
};

export { deleteRequest };
