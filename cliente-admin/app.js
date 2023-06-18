import dotenv from "dotenv";
import express from "express";
import path from "path";
import { writeFileSync } from "fs";
import "colors";
import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

// Generar archivo addresses.json con las dirección IP y puerto a los que debe dirigirse el navegador
try {
  const addresses = {
    administrationMicroserviceIp: process.env.ADMINISTRATION_MICROSERVICE_IP,
    administrationMicroservicePort: process.env.ADMINISTRATION_MICROSERVICE_PORT
  };
  writeFileSync("./public/addresses.json", JSON.stringify(addresses));
  console.log("Archivo creado y contenido escrito correctamente".bold.magenta);
} catch (error) {
  console.error(`Error en la escritura del archivo addresses.json. ${error}`.red);
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
