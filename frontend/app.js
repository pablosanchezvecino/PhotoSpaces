const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8080;

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
