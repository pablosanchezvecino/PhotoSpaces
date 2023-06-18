import "colors"
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import express from "express";

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;

const addresses = {
  requestHandlingMicroserviceIp: process.env.REQUEST_HANDLING_MICROSERVICE_IP,
  requestHandlingMicroservicePort: process.env.REQUEST_HANDLING_MICROSERVICE_PORT,
};

try {
  fs.writeFileSync("./public/addresses.json", JSON.stringify(addresses));
  console.log("Archivo creado y contenido escrito correctamente".bold.magenta);
} catch (error) {
  throw new Error(`Error al escribir el archivo addresses.json. ${error}`.red);
}

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