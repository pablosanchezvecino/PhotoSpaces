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

// Host del microservicio de gestión de peticiones
// Valor por defecto: "0.0.0.0" (se aceptan todas)
const requestHandlingMicroserviceHost = process.env.REQUEST_HANDLING_MICROSERVICE_HOST || "0.0.0.0";

// Puerto de escucha del microservicio de gestión de peticiones
// Valor por defecto: 9001
const requestHandlingMicroservicePort = process.env.REQUEST_HANDLING_MICROSERVICE_PORT || 9001;

export { 
  port,
  requestHandlingMicroserviceHost,
  requestHandlingMicroservicePort  
};