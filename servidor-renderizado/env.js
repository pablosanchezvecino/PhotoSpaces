import { isMainThread } from "worker_threads";
import dotenv from "dotenv";
import "colors";

// Carga de las variables de entorno


if (isMainThread) {
  if (process.env.DOCKER_CONTAINER_EXECUTION) {
    console.log("Ejecución en contenedor Docker detectada".bold.blue);
  } else {
    console.log("No se detectó ejecución en contenedor Docker, se cargarán las variables de entorno de fichero .env".bold.blue);
    dotenv.config();
  }
}


// Puerto de escucha del propio servidor de renderizado
// Valor por defecto: 3000
const port = process.env.PORT || 3000;

// Direcciones IP permitidas (en principio deberían ser las de los microservicios)
// Valor por defecto: "0.0.0.0" (se aceptan todas)
const allowedIpsString = process.env.ALLOWED_IPS || "0.0.0.0";
let allowedIps = null;
try {
  allowedIps = allowedIpsString.split(",");
} catch {
  throw new Error("Formato no válido en la variable de entorno ALLOWED_IPS");
}

// Mostrar salida del script Python
// Valor por defecto: true
const showPythonLogs = (process.env.SHOW_PYTHON_LOGS === undefined) ? true : process.env.SHOW_PYTHON_LOGS;

export { 
  port,
  allowedIps,
  showPythonLogs
};