import { spinnerHtml } from "../constants/spinnerHtml.js";
import { showAddModal } from "./modalLogic.js";
import {
  confirmationModal,
  confirmationModalConfirmationButton,
  confirmationModalReturnButton,
  confirmationModalBody
} from "./DOMElements.js";
import {
  administrationMicroserviceIp,
  administrationMicroservicePort
} from "../constants/parameters.js";

// Intenta añadir el servidor correspondiente a la IP introducida en el formulario
const addServer = async (serverIP, serverName) => {
  showAddModal();

  // Contactar con el microservicio de administración para que se encargue de añadir el nuevo servidor al sistema
  try {
    const response = await fetch(`http://${administrationMicroserviceIp}:${administrationMicroservicePort}/servers`, {
      method: "POST",
      body: JSON.stringify({ ip: serverIP, name: serverName }),
    });

    const jsonContent = await response.json();
    let alertContent = null;

    if (response.ok) {
      alertContent = "Servidor añadido correctamente";
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

const enableServer = async (serverId) => {
  confirmationModalReturnButton.style.display = "none";
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModalBody.innerHTML = spinnerHtml;
    
  // Contactar con el microservicio de administración para que se encargue de habilitar el servidor
  try {
    const response = await fetch(`http://${administrationMicroserviceIp}:${administrationMicroservicePort}/servers/${serverId}/enable`, { method: "POST" });

    const jsonContent = await response.json();
    let alertContent = null;

    if (response.ok) {
      alertContent = jsonContent.message;
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

const disableServer = async (serverId) => {
  confirmationModalReturnButton.style.display = "none";
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModalBody.innerHTML = spinnerHtml;

  try {
    const response = await fetch(`http://${administrationMicroserviceIp}:${administrationMicroservicePort}/servers/${serverId}/disable`, { method: "POST" });

    const jsonContent = await response.json();
    let alertContent = null;

    if (response.ok) {
      alertContent = jsonContent.message;
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

const abortServer = async (serverId) => {
  confirmationModalReturnButton.style.display = "none";
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModalBody.innerHTML = spinnerHtml;

  try {
    const response = await fetch(`http://${administrationMicroserviceIp}:${administrationMicroservicePort}/servers/${serverId}/abort`, { method: "POST" });

    const jsonContent = await response.json();
    let alertContent = null;

    if (response.ok) {
      alertContent = jsonContent.message;
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

const deleteServer = async (serverId) => {
  confirmationModalReturnButton.style.display = "none";
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModalBody.innerHTML = spinnerHtml;

  try {
    const response = await fetch(`http://${administrationMicroserviceIp}:${administrationMicroservicePort}/servers/${serverId}`, { method: "DELETE" });

    const jsonContent = await response.json();
    let alertContent = null;

    if (response.ok) {
      alertContent = "Servidor eliminado con éxito";
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

export { addServer, enableServer, disableServer, abortServer, deleteServer };
