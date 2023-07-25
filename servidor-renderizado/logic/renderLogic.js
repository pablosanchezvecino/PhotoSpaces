import { extractRemainingTimeMs, extractTotalBlenderTimeMs } from "./timeLogic.js";
import { parentPort, workerData } from "worker_threads";
import { showPythonLogs } from "../env.js";
import { spawn } from "child_process";
import path from "path";
import fs from "fs";
import "colors";

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
  console.error(`stderr: ${data}`.red);
  parentPort.postMessage("error");
});

command.stdout.on("data", (data) => {
  if (showPythonLogs) {
    console.log(data.toString().green);
  }
  if (data.toString().startsWith("Saved:")) {
    parentPort.postMessage(`Total: ${extractTotalBlenderTimeMs(data.toString())}`);
  }
  if (data.toString().includes("Remaining:")) {
    parentPort.postMessage(extractRemainingTimeMs(data));
  }
});

command.on("error", (error) => {
  console.error(`error: ${error.message}`.red);
  parentPort.postMessage("error");
});

command.on("close", () => {
  const filenameWithNoExtension = path.parse(`./temp/${workerData.filename}`).name;
  // Si se ha generado el png (ha ido todo bien)
  if (fs.existsSync(`./temp/${filenameWithNoExtension}.png`)) {
    console.log("Renderizado realizado con éxito".magenta);
  } else {
    parentPort.postMessage("error");
  }
});
