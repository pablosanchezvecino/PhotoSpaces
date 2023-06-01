import { addServer } from "./logic/serverLogic.js";
import { refresh } from "./logic/refreshLogic.js";
import { ipInput, nameInput } from "./logic/DOMElements.js";



window.handleSubmit = (event) => {
  event.preventDefault();
  // Intentar añadir servidor con dirección IP y nombre introducidos en el formulario
  addServer(ipInput.value, nameInput.value);
};

setInterval(refresh, 2000);
