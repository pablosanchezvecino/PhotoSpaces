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

  // Obtener SO, CPU y GPU del host
  let [osData, cpuData, gpuData] = await Promise.all([si.osInfo(), si.cpu(), si.graphics()]);
  specs.os = osData.distro;
  specs.cpu = cpuData.manufacturer + " " + cpuData.brand;
  console.log(gpuData.controllers);
  specs.gpu = gpuData.controllers[gpuData.controllers.length - 1].model;
  
  // Lanzar proceso que ejecute el comando "blender -v"
  const child = spawn("blender", ["-v"]);

  // Si blender está instalado, devolverá la versión de este
  child.stdout.on("data", (data) => {
    // Extraer la versión de la salida estándar del comando
    specs.blenderVersion = data
      .toString()
      .split("Blender ")[1]
      .split("\r")[0]
      .split("\n")[0]
      
  });

  // Tras finalizar la ejecución del comando responder a la petición con todos los datos
  child.on("exit", function (code, signal) {
    res.send(specs);
  });

  // Si Blender no está instalado, la ejecución del comando generará un error
  child.on("error", function (code, signal) {
    specs.blenderVersion = null;
    res.send(specs);
  });


  // Devolver información del servidor de renderizado
  
});

app.listen(port, () => {
  console.log(`Servidor de renderizado escuchando en el puerto ${port}`);
});
