import { administrationMicroserviceHost, administrationMicroservicePort } from "../constants/parameters.js";
import { showDownloadingRenderedImageModal } from "./modalLogic.js";
import { confirmationModal } from "./DOMElements.js";

const downloadRenderedImage = (id) => {
  // Mostrar modal de carga
  showDownloadingRenderedImageModal();

  fetch(`http://${administrationMicroserviceHost}:${administrationMicroservicePort}/requests/${id}/rendered-image`)
    .then(response => response.blob()) // Se convierte la respuesta en un objeto Blob
    .then(blob => {
      // Crear un enlace temporal para la descarga de la imagen
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;

      // Establecer el nombre del archivo para la descarga
      a.download = `${id}.png`;

      // Agregar el enlace al documento y hacer clic para iniciar la descarga
      document.body.appendChild(a);
      a.click();

      // Limpiar el enlace temporal
      window.URL.revokeObjectURL(url);

      // Ocultar modal de carga
      confirmationModal.hide();
    })
    .catch(error => {
      console.error("Error al descargar la imagen:", error);
    });
};

export { downloadRenderedImage };