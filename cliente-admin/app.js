import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";
import { printAsciiArt } from "./public/js/logic/asciiArtLogic.js";
import { writeFileSync } from "fs";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import "colors";

printAsciiArt();

if (process.env.DOCKER_CONTAINER_EXECUTION) {
  console.log("Ejecución en contenedor Docker detectada ".bold.blue);
} else {
  console.log("No se detectó ejecución en contenedor Docker, se cargarán las variables de entorno de fichero .env".bold.blue);
  dotenv.config();
}

const app = express();
const PORT = process.env.PORT || 8080;

// Generar archivo parameters.json con los parámetros cofigurables
try {
  const parameters = {
    administrationMicroserviceHost: (process.env.ADMINISTRATION_MICROSERVICE_HOST || "127.0.0.1"),
    administrationMicroservicePort: (process.env.ADMINISTRATION_MICROSERVICE_PORT || 9000),
    refreshPeriodMs: (process.env.REFRESH_PERIOD_MS || 1000),
    maxCardsPerContainer: (process.env.MAX_CARDS_PER_CONTAINER || 0)
  };
  writeFileSync("./public/parameters.json", JSON.stringify(parameters));
  console.log("Archivo parameters.json creado y contenido escrito correctamente".bold.magenta);
} catch (error) {
  console.error(`Error en la escritura del archivo parameters.json. ${error}`.red);
}

// Utilizar comprobación de direcciones IP
app.use(ipCheckMiddleware);

// Servir el directorio /public
app.use(express.static(path.join(path.resolve(), "public")));

app.listen(PORT, () =>
  console.log(
    `Cliente de administración desplegado en el puerto ${PORT}`.bold.magenta
  )
);
