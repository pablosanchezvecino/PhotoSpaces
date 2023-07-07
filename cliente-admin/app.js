import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";
import { printAsciiArt } from "./public/js/logic/asciiArtLogic.js";
import { writeFileSync } from "fs";
import express from "express";
import dotenv from "dotenv";
import path from "path";
import "colors";

printAsciiArt();

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Generar archivo parameters.json con las dirección IP y puerto a los que debe dirigirse el navegador
try {
  const parameters = {
    administrationMicroserviceIp: process.env.ADMINISTRATION_MICROSERVICE_IP,
    administrationMicroservicePort: process.env.ADMINISTRATION_MICROSERVICE_PORT,
    refreshPeriodMs: process.env.REFRESH_PERIOD_MS,
    maxCardsPerContainer: process.env.MAX_CARDS_PER_CONTAINER
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
