import dotenv from "dotenv";
import express from "express";
import path from "path";
import { writeFileSync } from "fs";
import "colors";
import { ipCheckMiddleware } from "./middleware/ipCheckMiddleware.js";

dotenv.config();

const app = express();
const PORT = process.env.PORT;

const addresses = {
  serverAdministrationMicroserviceIp: process.env.SERVER_ADMINISTRATION_MICROSERVICE_IP,
  serverAdministrationMicroservicePort: process.env.SERVER_ADMINISTRATION_MICROSERVICE_PORT
};

try {
  writeFileSync("./public/addresses.json", JSON.stringify(addresses));
  console.log("Archivo creado y contenido escrito correctamente".bold.magenta);
} catch (err) {
  console.error(err);
}



app.use(ipCheckMiddleware);

// Servir el directorio /public
app.use(express.static(path.join(path.resolve(), "public")));

app.listen(PORT, () =>
  console.log(
    `Cliente de administración desplegado en el puerto ${PORT}`
      .bold.magenta
  )
);
