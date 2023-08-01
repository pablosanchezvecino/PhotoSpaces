import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";
import { printAsciiArt } from "./logic/asciiArtLogic.js";
import { writeFileSync } from "fs";
import express from "express";
import path from "path";
import morgan from "morgan";
import { 
  port,
  administrationMicroserviceUrl,
  refreshPeriodMs,
  maxCardsPerContainer,
} from "./env.js";
import "colors";

printAsciiArt();

const app = express();

// Generar archivo parameters.json con los parámetros cofigurables
try {
  const parameters = {
    administrationMicroserviceUrl: administrationMicroserviceUrl,
    refreshPeriodMs: refreshPeriodMs,
    maxCardsPerContainer: maxCardsPerContainer
  };
  writeFileSync("./public/parameters.json", JSON.stringify(parameters));
  console.log("Archivo parameters.json creado y contenido escrito correctamente".bold.magenta);
} catch (error) {
  console.error(`Error en la escritura del archivo parameters.json. ${error}`.red);
}
app.use(morgan("dev"));

// Utilizar comprobación de direcciones IP
app.use(ipCheckMiddleware);

// Servir el directorio /public
app.use(express.static(path.join(path.resolve(), "public")));

app.listen(port, () =>
  console.log(
    `Cliente de administración desplegado en el puerto ${port}`.bold.magenta
  )
);
