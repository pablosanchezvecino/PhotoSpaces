import { setEstimatedRemainingProcessingTime } from "../serverStatus.js";
import dataString from "../constants/renderTestSettings.js";
import ServerStates from "../constants/serverStatesEnum.js";
import { performCleanup } from "../logic/cleanupLogic.js";
import { setStatus, getStatus } from "../serverStatus.js";
import { Worker } from "worker_threads";
import { spawn } from "child_process";
import si from "systeminformation";
import { readFileSync } from "fs";

// Funciones asociadas a los endpoints que llevan a cabo el renderizado

const bind = async (req, res) => {
  // Comprobar que el servidor se encuentra disponible
  if (getStatus() !== ServerStates.unbound) {
    res.status(400).send({ error: "El servidor no se encuentra disponible" });
    return;
  }

  // Inicializar cronómetro
  const hrStart = process.hrtime();

  // Realizar renderizado de prueba
  try {
    await render(JSON.parse(dataString), "renderTest.glb");
  } catch (error) {
    console.error(`Error en la prueba de renderizado. ${error}`.red);
    res.status(500).send({
      error: "Error en la prueba de renderizado",
    });
    return;
  }
  
  // Parar cronómetro
  const rEnd = process.hrtime(hrStart);

  try {
    performCleanup();
  } catch (error) {
    console.error(`Error al intentar borrar archivo renderTest.png. ${error}`.red);
  }
  // Borrar archivo renderTest.png generado

  // Pasar tiempo medido a milisegundos
  const timeSpentOnRenderTest = Math.round(rEnd[0] * 1000 + rEnd[1] / 1000000);

  let serverInfo = {};

  serverInfo.timeSpentOnRenderTest = timeSpentOnRenderTest;

  try {
    // Obtener SO, CPU y GPU del host
    const [osData, cpuData, gpuData] = await Promise.all([
      si.osInfo(),
      si.cpu(),
      si.graphics(),
    ]);

    serverInfo.os = osData.distro;
    serverInfo.cpu = cpuData.manufacturer + " " + cpuData.brand;
    serverInfo.gpu = gpuData.controllers[gpuData.controllers.length - 1].name;
  } catch (error) {
    console.error(`Error en la obtención de las especificaciones del sistema. ${error}`.red);
    res.status(500).send({
      error: "Error al intentar obtener la información del sistema",
    });
    return;
  }

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
    setStatus(ServerStates.idle);
    res.status(200).send(serverInfo);
  });

  child.on("error", (data) => {
    console.error(`Error en la obtención de la versión de Blender. ${data}`.red);
    res.status(500).send({
      error: "Error al intentar obtener la información del sistema",
    });
  });
};

const handleRenderingRequest = async (req, res) => {
  // TODO: Comprobar que el servidor se encuentra disponible
  // if (getStatus() !== ServerStates.idle) {
  //   res.status(400).send({ error: "El servidor no se encuentra disponible" });
  //   // return;
  // }

  // El servidor pasa a encontrarse ocupado
  setStatus(ServerStates.busy);

  let totalBlenderTime = null;
  // Obtener de la petición la información necesaria para el renderizado
  const parameters = JSON.parse(req.body.data);
  const requestId = req.body.requestId;

  // Comenzar proceso de renderizado
  try {
    totalBlenderTime = await render(parameters, req.file.filename);
    setEstimatedRemainingProcessingTime(null);
  } catch (error) {
    console.error(`Error en el proceso de renderizado. ${error}`.red);
    performCleanup();
    res.status(500).send({ error: "Error en el proceso de renderizado" });
    setStatus(ServerStates.idle);
    return;
  }

  // El servidor vuelve a encontrarse disponible
  setStatus(ServerStates.idle);

  const pngContent = readFileSync(`./temp/${requestId}.png`, "base64");
  await res.status(200).send({ totalBlenderTime: totalBlenderTime, renderedImage: pngContent });
  performCleanup();
};

const render = (parameters, filename) => {
  return new Promise((resolve, reject) => {
    let totalBlenderTime = null;
    // Creamos el worker (thread) para la ejecución del renderizado
    const worker = new Worker("./logic/renderLogic.js", {
      workerData: {
        parameters: parameters,
        filename: filename
      },
    });

    // Recibimos los mensajes del worker con el tiempo de espera estimado en ms
    worker.on("message", (message) => {
      if (message === "error") {
        reject("Recibido error de worker");
      } else if (message.toString().startsWith("Total: ")) {
        totalBlenderTime = Number(message.slice(7));
      } else {
        // Actualizamos la BD con este valor para que lo pueda consultar el 
        // microservicio de administración y que el de gestion de peticiones 
        // pueda responder las peticiones del cliente
        setEstimatedRemainingProcessingTime(message);
      }
    });

    worker.on("exit", () => {
      resolve(totalBlenderTime);
    });
  });
};

export { bind, handleRenderingRequest };
