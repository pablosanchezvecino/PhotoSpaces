import dotenv from "dotenv";
import "colors";

// Carga de las variables de entorno

dotenv.config();

// URL del microservicio de gestión de peticiones
// Valor por defecto: "http://localhost:9001"
const requestHandlingMicroserviceUrl = process.env.REQUEST_HANDLING_MICROSERVICE_URL || "http://localhost:9001";

// Tiempo de espera (en ms) entre la recepción de la respuesta a una consulta 
// del estado de la petición enviada y la siguiente
// Valor por defecto: 1000 (1s)
const pollingIntervalMs = process.env.POLLING_INTERVAL_MS || 1000;

export { 
  requestHandlingMicroserviceUrl,
  pollingIntervalMs
};