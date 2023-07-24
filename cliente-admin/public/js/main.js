import { ipInput, nameInput } from "./logic/DOMElements.js";
import { refreshPeriodMs } from "./constants/parameters.js";
import { addServer } from "./logic/serverLogic.js";
import { refresh } from "./logic/refreshLogic.js";

window.handleSubmit = (event) => {
  event.preventDefault();
  // Intentar añadir servidor con dirección IP y nombre introducidos en el formulario
  addServer(ipInput.value, nameInput.value);
};

// Refresco inicial
await refresh();

// Refrescos periódicos
setInterval(refresh, refreshPeriodMs || 2000);
