import { parentPort, workerData } from "worker_threads";
import { spawn } from "child_process";
import fs from "fs";
import "colors";
import { extractRemainingTimeMs } from "./timeLogic.js";

// Introducir comando blender -b -P <ruta_del_script> -- <ruta_del_archivo_con_la_escena> <string_con_los_parametros>
const command = spawn(
  process.env.BLENDER_CMD || "blender",
  [
    "-b",
    "-P",
    process.env.BLENDER_SCRIPT || "./renderScript.py",
    "--",
    `${workerData.filename}`,
    `${JSON.stringify(workerData.parameters)}`,
  ],
  { detached: true }
);


command.stderr.on("data", (data) => {
  console.error(`stderr: ${data}`);
});

command.stdout.on("data", (data) => {
  if (process.env.SHOW_PYTHON_LOGS) {
    console.log(data.toString().green);
  }
  if (data.toString().includes("Remaining:")) {
    parentPort.postMessage(extractRemainingTimeMs(data));
  }
});

command.on("error", (error) => {
  console.error(error.message);
});

command.on("close", () => {
  // Si se ha generado el png (ha ido todo bien)
  if (fs.existsSync(`./temp/${workerData.filename}.png`)) {
    console.log("Renderizado realizado con éxito".magenta);

    // Si no era un renderizado de prueba
    if (workerData.filename !== "renderTest") {
      try {
        // Borrar el archivo temporal con la escena
        console.log(`Eliminando archivo ${workerData.filename}.gltf...`.magenta);
        fs.unlinkSync(`./temp/${workerData.filename}.gltf`);
        console.log(`Archivo ${workerData.filename}.gltf eliminado`.magenta);
      } catch (err) {
        console.error(`Error al intentar eliminar ${workerData.filename}.gltf`);
      }
    }
  } else {
    console.error("Error durante el proceso de renderizado");
  }
});
