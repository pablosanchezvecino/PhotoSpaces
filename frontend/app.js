const express = require("express");
const path = require("path");
const fs = require('fs');
require('dotenv').config()

const app = express();
const PORT = process.env.PORT || 8081;

const addresses = {
  requestHandlingMicroserviceIp: process.env.REQUEST_HANDLING_MICROSERVICE_IP,
  requestHandlingMicroservicePort: process.env.REQUEST_HANDLING_MICROSERVICE_PORT
};

try {
  fs.writeFileSync("./public/addresses.json", JSON.stringify(addresses));
  console.log("Archivo creado y contenido escrito correctamente");
} catch (err) {
  console.error(err);
}

// Servir el directorio /public
app.use(express.static(__dirname + "/public"));

// Servir la librería three.js
app.use(
  "/build/",
  express.static(path.join(__dirname, "node_modules/three/build"))
);
app.use(
  "/jsm/",
  express.static(path.join(__dirname, "node_modules/three/examples/jsm"))
);

app.listen(PORT, () =>
  console.log(`> Servidor desplegado en el puerto ${PORT}`)
);
