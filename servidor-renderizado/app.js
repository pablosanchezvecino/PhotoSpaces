require('dotenv').config()
const express = require("express");
const cors = require('cors');
const morgan = require('morgan');


const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(morgan("dev"));

app.get("/specs", async (req, res) => {
  const { spawn } = require("child_process");
  const si = require("systeminformation");

  let specs = {};

  // Lanzar proceso que ejecute el comando "blender -v"
  const child = spawn("blender", ["-v"]);

  // Si blender está instalado, devolverá la versión de este
  child.stdout.on("data", (data) => {
    // Extraer la versión de la salida estándar del comando
    specs.blenderVersion = data
      .toString()
      .split("\r\n")[0]
      .split("\n\t")[0]
      .substr(8);
  });

  // Tras finalizar la ejecución del comando responder a la petición con todos los datos
  child.on("exit", function (code, signal) {});

  // Si Blender no está instalado, la ejecución del comando generará un error
  child.on("error", function (code, signal) {
    specs.blenderVersion = null;
  });

  // Obtener SO, CPU y GPU del host
  let [osData, cpuData, gpuData] = await Promise.all([si.osInfo(), si.cpu(), si.graphics()]);
  specs.os = osData.distro;
  specs.cpu = cpuData.manufacturer + " " + cpuData.brand;
  console.log(gpuData.controllers);
  specs.gpu = gpuData.controllers[gpuData.controllers.length - 1].model;

  // Devolver información del servidor de renderizado
  res.send(specs);
});

app.listen(port, () => {
  console.log(`Servidor de renderizado escuchando en el puerto ${port}`);
});
