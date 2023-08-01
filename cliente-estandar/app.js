import { port, requestHandlingMicroserviceUrl } from "./env.js";
import { printAsciiArt } from "./logic/asciiArtLogic.js";
import express from "express";
import morgan from "morgan";
import path from "path";
import fs from "fs";
import "colors";

printAsciiArt();

const app = express();

const parameters = {
  requestHandlingMicroserviceUrl: requestHandlingMicroserviceUrl
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