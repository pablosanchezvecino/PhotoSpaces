// Funciones asociadas a los endpoints que llevan a cabo el renderizado

import { spawn } from "child_process";
import fs from "fs";
import si from "systeminformation";
import { setStatus, getStatus } from "../serverStatus.js";
import ServerStates from "../constants/serverStatesEnum.js";
import { Worker } from "worker_threads";
import dataString from "../constants/renderTestSettings.js";

const test = async (req, res) => {
  // Comprobar que el servidor se encuentra disponible
  if (getStatus() !== ServerStates.idle) {
    res.status(400).send({ error: "El servidor no se encuentra disponible" });
  }

  // Inicializar cronómetro
  const hrStart = process.hrtime();

  // Realizar renderizado de prueba
  try {
    await render(JSON.parse(dataString), "renderTest");
  } catch (error) {
    res.status(500).send({
      error: "Error en la prueba de renderizado",
    });
    return;
  }

  // Borrar archivo renderTest.png generado
  fs.unlinkSync("./temp/renderTest.png");

  // Parar cronómetro
  const rEnd = process.hrtime(hrStart);

  // Pasar tiempo medido a milisegundos
  const timeSpentOnRenderTest = Math.round(rEnd[0] * 1000 + rEnd[1] / 1000000);

  let serverInfo = {};

  serverInfo.timeSpentOnRenderTest = timeSpentOnRenderTest;

  // Obtener SO, CPU y GPU del host
  let [osData, cpuData, gpuData] = await Promise.all([
    si.osInfo(),
    si.cpu(),
    si.graphics(),
  ]);
  serverInfo.os = osData.distro;
  serverInfo.cpu = cpuData.manufacturer + " " + cpuData.brand;
  //console.log(gpuData.controllers);
  serverInfo.gpu = gpuData.controllers[gpuData.controllers.length - 1].model;

  // Lanzar proceso que ejecute el comando "blender -v"
  const child = spawn(process.env.BLENDER_CMD || "blender", ["-v"]);

  // Si Blender está instalado, devolverá la versión de este
  child.stdout.on("data", (data) => {
    // Extraer la versión de la salida estándar del comando
    serverInfo.blenderVersion = data
      .toString()
      .split("Blender ")[1]
      .split("\r")[0]
      .split("\n")[0];
  });

  // Tras finalizar la ejecución del comando responder a la petición con todos los datos
  child.on("exit", () => {
    res.status(200).send(serverInfo);
  });

  child.on("error", () => {
    res.status(500).send({
      error: "Error al intentar obtener la información del sistema",
    });
  });
};

const handleRenderingRequest = async (req, res) => {
  // Comprobar que el servidor se encuentra disponible
  if (getStatus() !== ServerStates.idle) {
    res.status(400).send({ error: "El servidor no se encuentra disponible" });
  }

  // El servidor pasa a encontrarse ocupado
  setStatus(ServerStates.busy);

  // Opciones para la respuesta a la petición
  const options = {
    root: "./temp/",
    dotfiles: "deny",
    headers: {
      "x-timestamp": Date.now(),
      "x-sent": true,
    },
  };

  // Obtener de la petición la información necesaria para el renderizado
  const parameters = JSON.parse(req.body.data);
  const model = req.files.model;
  const requestId = req.body.requestId;
  fs.writeFileSync(`./temp/${requestId}.gltf`, Buffer.from(model.data));

  // Renderizado
  try {
    await render(parameters, requestId);
  } catch (error) {
    res.status(500).send({ error: "Error en el proceso de renderizado" });
  }

  // El servidor vuelve a encontrarse disponible
  setStatus(ServerStates.idle);

  // Devolver archivo .png generado
  res.status(200).sendFile(`${requestId}.png`, options, (error) => {
    if (error) {
      console.error("Error al devolver la imagen renderizada");
    } else {
      console.log("Imagen renderizada devuelta correctamente".magenta);
      // Borrar archivo .png temporal
      console.log(`Eliminando archivo ${requestId}.png`.magenta);
      fs.unlinkSync(`./temp/${requestId}.png`);
      console.log(`Archivo ${requestId}.png eliminado correctamente`.magenta);

    }
  });
};

const render = (parameters, filename) => {
  return new Promise((resolve) => {
    // Creamos el worker (thread) para la ejecución de el renderizado
    const worker = new Worker("./logic/renderLogic.js", {
      workerData: {
        parameters: parameters,
        filename: filename,
      },
    });

    // Recibimos los mensajes del worker, si es un mensaje de tiempo
    // actualizamos el objeto, sino, respondemos a la petición y
    // borramos los ficheros temporales
    worker.on("message", (message) => {
      console.log(message.green);
    });

    worker.on("exit", (code) => {
      console.log(`Worker terminado con código ${code}`);

      resolve();
    });
  });
};

export { test, handleRenderingRequest };
