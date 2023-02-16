const express = require("express");
const path = require("path");
const app = express();
const PORT = process.env.PORT || 8080;

// Servir el directorio /public
app.use(express.static(__dirname + "/public"));


app.listen(PORT, () =>
  console.log(`Cliente de administración de servidores desplegado en el puerto ${PORT}`)
);
