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
// Valor por defecto: 8081
const port = process.env.PORT || 8081;

// URL del microservicio de gestión de peticiones
// Valor por defecto: "http://localhost:9001"
const requestHandlingMicroserviceUrl = process.env.REQUEST_HANDLING_MICROSERVICE_URL || "http://localhost:9001";

export { 
  port,
  requestHandlingMicroserviceUrl
};