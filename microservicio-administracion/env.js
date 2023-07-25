import dotenv from "dotenv";
import "colors";

// Carga de las variables de entorno

if (process.env.DOCKER_CONTAINER_EXECUTION) {
  console.log("Ejecución en contenedor Docker detectada".bold.blue);
} else {
  console.log("No se detectó ejecución en contenedor Docker, se cargarán las variables de entorno de fichero .env".bold.blue);
  dotenv.config();
}

// URL para la conexión con la base de datos
// Valor por defecto: ""
const mongoDbConnectionString = process.env.MONGODB_CONNECTION_STRING || "";

// Puerto de escucha del propio microservicio
// Valor por defecto: 9000
const port = process.env.PORT || 9000;

// Puerto de escucha de los servidores de renderizado
// Valor por defecto: 3000
const renderServerPort = process.env.RENDER_SERVER_PORT || 3000;

// Host del microservicio de gestión de peticiones
// Valor por defecto: "127.0.0.1"
const requestHandlingMicroserviceHost = process.env.REQUEST_HANDLING_MICROSERVICE_HOST || "127.0.0.1";

// Puerto de escucha del microservicio de gestión de peticiones
// Valor por defecto: 9001
const requestHandlingMicroservicePort = process.env.REQUEST_HANDLING_MICROSERVICE_PORT || 9001;

// Direcciones IP permitdas (en principio deberían ser las de los administradores del sistema)
// Valor por defecto: "0.0.0.0" (se aceptan todas)
const allowedIpsString = process.env.ALLOWED_IPS || "0.0.0.0";
let allowedIps = null;
try {
  allowedIps = allowedIpsString.split(",");
} catch {
  throw new Error("Formato no válido en la variable de entorno ALLOWED_IPS");
}

export { 
  mongoDbConnectionString,
  port,
  renderServerPort,
  requestHandlingMicroserviceHost,
  requestHandlingMicroservicePort,
  allowedIps
};