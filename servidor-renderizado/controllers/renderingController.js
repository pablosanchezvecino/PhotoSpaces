import { setEstimatedRemainingProcessingTime, setLatestRequest } from "../serverStatus.js";
import dataString from "../constants/renderTestSettings.js";
import ServerStates from "../constants/serverStatesEnum.js";
import { setStatus, getStatus } from "../serverStatus.js";
import { readFileSync, unlinkSync } from "fs";
import { Worker } from "worker_threads";
import { spawn } from "child_process";
import si from "systeminformation";
import path from "path";

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
    res.status(500).send({ error: "Error en la prueba de renderizado" });
    return;
  }
  
  // Parar cronómetro
  const rEnd = process.hrtime(hrStart);

  // Eliminar fichero renderTest.png generado
  try {
    unlinkSync("./temp/renderTest.png");
  } catch (error) {
    console.error(`Error al intentar borrar archivo renderTest.png. ${error}`.red);
  }

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
    try {
      serverInfo.gpu = gpuData.controllers[gpuData.controllers.length - 1].name || "N/A";
    } catch {
      serverInfo.gpu = "N/A";
    }
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

  // Obtener de la petición la información necesaria para el renderizado
  const parameters = JSON.parse(req.body.data);
  const requestId = req.body.requestId;

  // El servidor pasa a encontrarse ocupado
  setStatus(ServerStates.busy);
  setLatestRequest(requestId);

  // Comenzar proceso de renderizado
  const filename = req.file ? req.file.filename : req.body.filename;
  let totalBlenderTime = null;
  try {

    totalBlenderTime = await render(parameters, filename);
    
  } catch (error) {
    setEstimatedRemainingProcessingTime(null);
    setStatus(ServerStates.idle);
    console.error(`Error en el proceso de renderizado. ${error}`.red);
    res.status(500).send({ error: "Error en el proceso de renderizado" });
    return;
  }
  
  // El servidor vuelve a encontrarse disponible
  setEstimatedRemainingProcessingTime(null);
  setStatus(ServerStates.idle);

  let pngContent = null;
  try {
    pngContent = readFileSync(`./temp/${requestId}.png`, "base64");
  } catch (error) {
    console.error(`Error al leer el archivo ${requestId}.png antes de devolverlo. ${error}`.red);
    res.status(500).send({ error: "Error al leer la imagen generada antes de devolverla" });
    return;
  }
  
  await res.status(200).send({ totalBlenderTime: totalBlenderTime, renderedImage: pngContent });

  // Eliminar ficheros asociados a la petición procesada
  try {
    unlinkSync(`./temp/${filename}`);
    unlinkSync(`./temp/${path.parse(filename).name}.png`);
  } catch (error) {
    console.error(`Error al intentar eliminar los ficheros asociados a la petición procesada. ${error}`.red);
  }
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
