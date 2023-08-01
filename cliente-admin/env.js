import dotenv from "dotenv";
import "colors";

// Carga de las variables de entorno

if (process.env.DOCKER_CONTAINER_EXECUTION) {
  console.log("Ejecución en contenedor Docker detectada".bold.blue);
} else {
  console.log("No se detectó ejecución en contenedor Docker, se cargarán las variables de entorno de fichero .env".bold.blue);
  dotenv.config();
}

// Puerto de escucha del propio servidor
// Valor por defecto: 8080
const port = process.env.PORT || 8080;

// URL del microservicio de administración
// Valor por defecto: "http://localhost:9000"
const administrationMicroserviceUrl = process.env.ADMINISTRATION_MICROSERVICE_URL || "http://localhost:9000";

// Periodo (en ms) de refresco del panel de administración
// Valor por defecto: 1000 (1s)
const refreshPeriodMs = process.env.REFRESH_PERIOD_MS || 1000;

// Cantidad máxima de tarjetas que se mostrará por cada contenedor del panel de administración
// Valor por defecto: 0 (sin límite)
const maxCardsPerContainer = process.env.MAX_CARDS_PER_CONTAINER || 0;

// Direcciones IP a los que se servirá el contenido (en principio deberían ser las de los administradores del sistema)
// Valor por defecto: "0.0.0.0" (se aceptan todas)
const allowedIpsString = process.env.ALLOWED_IPS || "0.0.0.0";
let allowedIps = null;
try {
  allowedIps = allowedIpsString.split(",");
} catch {
  throw new Error("Formato no válido en la variable de entorno ALLOWED_IPS");
}

export { 
  port,
  administrationMicroserviceUrl,
  refreshPeriodMs,
  maxCardsPerContainer,
  allowedIps
};