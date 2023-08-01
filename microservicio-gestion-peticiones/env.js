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
// Valor por defecto: 9001
const port = process.env.PORT || 9001;

// Puerto de escucha de los servidores de renderizado
// Valor por defecto: 3000
const renderServerPort = process.env.RENDER_SERVER_PORT || 3000;

// URL del microservicio de administración
// Valor por defecto: "http://localhost:9000"
const administrationMicroserviceUrl = process.env.ADMINISTRATION_MICROSERVICE_URL || "http://localhost:9000";

// Dirección de correo electrónico de la cuenta Gmail que envía los correos automatizados
// Valor por defecto: ""
const emailUser = process.env.EMAIL_USER || "";

// Contraseña para el acceso a la cuenta de Gmail que envía los correos automatizados
// Valor por defecto: ""
const emailPassword = process.env.EMAIL_PASSWORD || "";

// Periodo (en ms) de la comprobación de la cola y los servidores disponibles.
// Suponiendo que todo funciona correctamente, no debería realizar ningún envío 
// pero, en caso de que se llegara situaciones inesperadas, puede resultar útil como respaldo
// Valor por defecto: 30000 (30s)
const dbCheckPeriodMs = process.env.DB_CHECK_PERIOD_MS || 30000;

// Periodo (en ms) de limpieza de archivos temporales que se hayan podido quedar escritos 
// y que ya no son necesarios
// Valor por defecto: 86400000 (24h)
const cleanupIntervalMs = process.env.CLEANUP_INTERVAL_MS || 86400000;

// Tiempo de espera (en ms) entre las finalización de una ronda de reintento de los envíos 
// de todos los emails pendientes y la siguiente
// Valor por defecto: 3600000 (1h)
const emailSendingBackupIntervalMs = process.env.EMAIL_SENDING_BACKUP_INTERVAL_MS || 3600000;

// Tiempo de espera (en ms) entre la recepción de la respuesta a una consulta 
// del tiempo restante estimado al servidor de renderizado y la siguiente
// Valor por defecto: 1000 (1s)
const renderServerPollingIntervalMs = process.env.RENDERING_SERVER_POLLING_INTERVAL_MS || 1000;

// Tamaño máximo de archivo en bytes que aceptará el servidor
// Valor por defecto: Infinity (no se establece límite)
const maxFileSizeBytes = process.env.MAX_FILE_SIZE_BYTES || Infinity;

export { 
  mongoDbConnectionString,
  port,
  renderServerPort,
  administrationMicroserviceUrl,
  emailUser,
  emailPassword,
  dbCheckPeriodMs,
  cleanupIntervalMs,
  emailSendingBackupIntervalMs,
  renderServerPollingIntervalMs,
  maxFileSizeBytes
};