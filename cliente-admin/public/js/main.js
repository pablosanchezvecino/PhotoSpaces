import { ipInput, nameInput } from "./logic/DOMElements.js";
import { addServer } from "./logic/serverLogic.js";
import { setUpRefreshInterval } from "./logic/refreshLogic.js";

window.handleSubmit = (event) => {
  event.preventDefault();
  // Intentar añadir servidor con dirección IP y nombre introducidos en el formulario
  addServer(ipInput.value, nameInput.value);
};
setUpRefreshInterval();

