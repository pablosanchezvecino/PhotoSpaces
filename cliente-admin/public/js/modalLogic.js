import {
  confirmationModal,
  confirmationModalLabel,
  confirmationModalBody,
  confirmationModalConfirmationButton,
  confirmationModalReturnButton,
} from "./DOMElements.js";

const showAddModal = () => {
  confirmationModalLabel.innerText = "Añadiendo Servidor...";
  confirmationModalBody.innerHTML = `<div class="d-flex justify-content-center"><div class="spinner-border text-secondary" role="status"><span class="visually-hidden">Loading...</span></div></div>`;
  confirmationModalConfirmationButton.style.display = "none";
  confirmationModal.show();
};

const showDeleteModal = (serverId) => {
  confirmationModalLabel.innerText = "Eliminar Servidor";
  confirmationModalBody.innerText = "¿Eliminar servidor del sistema?";
  confirmationModalConfirmationButton.className = "btn btn-danger";
  confirmationModalConfirmationButton.innerText = "Eliminar";
  confirmationModalReturnButton.style.display = "block";
  confirmationModalConfirmationButton.style.display = "block";
  confirmationModalConfirmationButton.onclick = () => deleteServer(serverId);
  confirmationModal.show();
};

const showDisableModal = (serverId) => {
  confirmationModalLabel.innerText = "Deshabilitar Servidor";
  confirmationModalBody.innerText = "¿Deshabilitar servidor?";
  confirmationModalConfirmationButton.className = "btn btn-danger";
  confirmationModalConfirmationButton.innerText = "Deshabilitar";
  confirmationModalReturnButton.style.display = "block";
  confirmationModalConfirmationButton.style.display = "block";
  confirmationModalConfirmationButton.onclick = () => disableServer(serverId);
  confirmationModal.show();
};

const showEnableModal = (serverId) => {
  confirmationModalLabel.innerText = "Habilitar Servidor";
  confirmationModalBody.innerText = "¿Habilitar servidor?";
  confirmationModalConfirmationButton.className = "btn btn-success";
  confirmationModalConfirmationButton.innerText = "Habilitar";
  confirmationModalReturnButton.style.display = "block";
  confirmationModalConfirmationButton.style.display = "block";
  confirmationModalConfirmationButton.onclick = () => enableServer(serverId);
  confirmationModal.show();
};
