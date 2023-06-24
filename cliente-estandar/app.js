import "colors"
import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import express from "express";
import morgan from "morgan";

dotenv.config();

const app = express();
const port = process.env.PORT || 8081;

const parameters = {
  requestHandlingMicroserviceIp: process.env.REQUEST_HANDLING_MICROSERVICE_IP,
  requestHandlingMicroservicePort: process.env.REQUEST_HANDLING_MICROSERVICE_PORT
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