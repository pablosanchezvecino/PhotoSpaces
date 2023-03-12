// Funciones asociadas al endpoint POST /test
const { spawn } = require("child_process");
const fs = require("fs");
const si = require("systeminformation");

const test = async (req, res) => {
  // Realizar renderizado de prueba
  if (!(await renderTest(res))) {
    res.status(500).send({
      error: "Error en la prueba de renderizado",
    });
    return;
  }

  // Obtener SO, CPU y GPU del host
  let specs = {};

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
    res.status(200).send(specs);
  });

  child.on("error", function (code, signal) {
    res.status(500).send({
      error: "Error al intentar obtener las especificaciones del sistema",
    });
  });
};

const renderTest = (res) => {
  return new Promise((resolve) => {
    const dataString = require("../constants/renderTestSettings");
    const command = spawn("blender", [
      "-b",
      "-P",
      process.env.BLENDER_SCRIPT || "./renderScript.py",
      "renderTest",
      `${dataString}`,
    ]);

    command.stderr.on("data", (data) => {
      console.error(`stderr: ${data}`);
      resolve(false);
    });

    command.stdout.on("data", (data) => {
      console.log(data.toString().yellow);
    });

    command.on("error", (err) => {
      console.error(err.message);
      resolve(false);
    });

    command.on("close", () => {
      if (fs.existsSync("./res/renderTest.png")) {
        try {
          console.log("Renderizado de prueba realizado con éxito");
          console.log("Eliminando archivo renderTest.png generado...");
          fs.unlinkSync("./res/renderTest.png");
          console.log("Archivo renderTest.png eliminado");
        } catch (err) {
          console.error("Error al intentar eliminar renderTest.png");
        }
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

module.exports = {
  test,
};
