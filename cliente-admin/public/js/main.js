import { addServer } from "./logic/serverLogic.js";
import { refresh } from "./logic/refreshLogic.js";
import { ipInput, nameInput } from "./logic/DOMElements.js";
import { refreshPeriodMs } from "./constants/parameters.js";


window.handleSubmit = (event) => {
  event.preventDefault();
  // Intentar añadir servidor con dirección IP y nombre introducidos en el formulario
  addServer(ipInput.value, nameInput.value);
};

await refresh();

setInterval(refresh, refreshPeriodMs || 2000);
