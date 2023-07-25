import dotenv from "dotenv";
import "colors";

// Carga de las variables de entorno

dotenv.config();

// Host del microservicio de gestión de peticiones
// Valor por defecto: "127.0.0.1"
const requestHandlingMicroserviceHost = process.env.REQUEST_HANDLING_MICROSERVICE_HOST || "127.0.0.1";

// Puerto de escucha del microservicio de gestión de peticiones
// Valor por defecto: 9001
const requestHandlingMicroservicePort = process.env.REQUEST_HANDLING_MICROSERVICE_PORT || 9001;

// Tiempo de espera (en ms) entre la recepción de la respuesta a una consulta 
// del estado de la petición enviada y la siguiente
// Valor por defecto: 1000 (1s)
const pollingIntervalMs = process.env.POLLING_INTERVAL_MS || 1000;

export { 
  requestHandlingMicroserviceHost,
  requestHandlingMicroservicePort,
  pollingIntervalMs
};