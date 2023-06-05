import { readdirSync, unlinkSync } from "fs";
import { parse } from "path";
import Request from "../models/Request.js";

const tempDir = "./temp";

const setUpCleanupInterval = () => {
  setInterval(performCleanup, process.env.CLEANUP_INTERVAL_MS);
};

const performCleanup = () => {
  console.log("Comprobando archivos temporales innecesarios...".bold.yellow);

  let files = null;

  try {
    files = readdirSync(tempDir);
  } catch (error) {
    console.error(
      `Error al leer el directorio de archivos temporales: ${error}`.red
    );
    return;
  }

  files.forEach(async (file) => {
    const id = parse(file).name;

    // No podemos eliminar el archivo si tenemos guardada en BD su petición 
    // correspondiente y esta no ha sido satisfecha aún
    let requestExistsAndIsNotFulfilled = null;
    try {
      requestExistsAndIsNotFulfilled = await Request.exists({ _id: id, status: { $ne: "fulfilled" } });
    } catch (error) {
      console.error(`Error al consultar id ${id} en la base de datos: ${error}`.red);
    }

    if (!requestExistsAndIsNotFulfilled) {
      try {
        unlinkSync(`${tempDir}/${file}`);
        console.log(`Archivo ${file} borrado exitosamente.`.yellow);
      } catch (error) {
        console.error(`Error al intentar borrar el archivo ${file}: ${error}`.red);
      }
    }
  });

  console.log("Comprobación de archivos temporales innecesarios finalizada".bold.yellow);
};

export { setUpCleanupInterval };
