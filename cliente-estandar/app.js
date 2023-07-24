import { printAsciiArt } from "./logic/asciiArtLogic.js";
import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import "colors";

printAsciiArt();

if (process.env.DOCKER_CONTAINER_EXECUTION) {
  console.log("Ejecución en contenedor Docker detectada ".bold.blue);
} else {
  console.log("No se detectó ejecución en contenedor Docker, se cargarán las variables de entorno de fichero .env".bold.blue);
  dotenv.config();
}

const app = express();
const port = process.env.PORT || 8081;

const parameters = {
  requestHandlingMicroserviceHost: (process.env.REQUEST_HANDLING_MICROSERVICE_HOST || "127.0.0.1"),
  requestHandlingMicroservicePort: (process.env.REQUEST_HANDLING_MICROSERVICE_PORT || 9001)
};

try {
  fs.writeFileSync("./public/parameters.json", JSON.stringify(parameters));
  console.log("Archivo creado y contenido escrito correctamente".bold.magenta);
} catch (error) {
  throw new Error(`Error al escribir el archivo parameters.json. ${error}`.red);
}

app.use(morgan("dev"));


// Servir el directorio /public
app.use(express.static(path.join("./public")));

// Servir la librería three.js
app.use(
  "/build/",
  express.static("./node_modules/three/build")
);
app.use(
  "/jsm/",
  express.static("./node_modules/three/examples/jsm")
);

app.listen(port, () => {
  console.log(
    `Cliente estándar escuchando en el puerto ${port}`.bold.magenta
  );
});