const ServerStates = require("./constants/serverStatesEnum.js");
require("dotenv").config();
const express = require("express");
const cors = require("cors");
const morgan = require("morgan");

const app = express();
const port = process.env.PORT;

app.use(cors());
app.use(morgan("dev"));

let currentState = ServerStates.idle;

// Para debugging
setInterval(() => console.log(currentState), 5000);

app.get("/specs", async (req, res) => {
  const { spawn } = require("child_process");
  const si = require("systeminformation");

  let specs = {};

  // Obtener SO, CPU y GPU del host
  let [osData, cpuData, gpuData] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.graphics(),
  ]);
  specs.os = osData.distro;
  specs.cpu = cpuData.manufacturer + " " + cpuData.brand;
  //console.log(gpuData.controllers);
  specs.gpu = gpuData.controllers[gpuData.controllers.length - 1].model;

  // Lanzar proceso que ejecute el comando "blender -v"
  const child = spawn("blender", ["-v"]);

  // Si Blender está instalado, devolverá la versión de este
  child.stdout.on("data", (data) => {
    // Extraer la versión de la salida estándar del comando
    specs.blenderVersion = data
      .toString()
      .split("Blender ")[1]
      .split("\r")[0]
      .split("\n")[0];
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
});

app.post("/disable", async (req, res) => {
  // Solo es posible deshabilitar el servidor si se encuentra en estado "idle"
  if (currentState === ServerStates.busy) {
    res.status(400).send({error: "El servidor se encuentra procesando una petición"});
    return;
  } else if (currentState === ServerStates.disabled) {
    res.status(400).send({error: "El servidor ya se encuentra deshabilitado"});
    return;
  }

  console.log("Deshabilitando servidor...");
  currentState = ServerStates.disabled;
  res.status(200).send({message: "Servidor deshabilitado con éxito"});
});

app.post("/enable", async (req, res) => {
  // Solo es posible habilitar el servidor si se encuentra en estado "disabled"
  if (currentState === ServerStates.busy) {
    res.status(400).send({error: "El servidor ya se encuentra habilitado y procesando una petición"});
    return;
  } else if (currentState === ServerStates.idle) {
    res.status(400).send({error: "El servidor ya se encuentra habilitado y a la espera de peticiones"});
    return;
  }

  console.log("Habilitando servidor...");
  currentState = ServerStates.idle;
  res.status(200).send({message: "Servidor habilitado con éxito"});
});













app.listen(port, () => {
  console.log(`Servidor de renderizado escuchando en el puerto ${port}`);
});
