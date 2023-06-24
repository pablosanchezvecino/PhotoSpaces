import PendingEmail from "../models/PendingEmail.js";
import { readdirSync, unlinkSync } from "fs";
import Request from "../models/Request.js";
import { parse, extname } from "path";
import { wait } from "./timeLogic.js";
import mongoose from "mongoose";

// Funciones relacionadas con la limpieza periódica de archivos temporales

const tempDir = "./temp";

// Iniciar ejecución periódica de la limpieza
const setUpCleanupInterval = async () => {
  // eslint-disable-next-line no-constant-condition
  while (true) {
    await wait(process.env.CLEANUP_INTERVAL_MS);
    await performCleanup();
  }
};

// Eliminar todos los archivos de la carpeta /temp que ya no sean necesarios
const performCleanup = async () => {
  console.log("Comprobando archivos temporales innecesarios...".bold.yellow);

  let files = null;
  try {
    files = readdirSync(tempDir);
  } catch (error) {
    console.error(`Error al leer el directorio de archivos temporales: ${error}`.red);
    return;
  }

  files.forEach(async (file) => {
    // No podemos eliminar el archivo si se cumple alguna de las siguientes condiciones:
    // 1) Aún se está transfiriendo en el contexto de la llegada de la petición al microservicio (no tendrá un oid de MongoDB como nombre)
    // 2) Tenemos guardada en BD su petición correspondiente y esta no ha sido satisfecha aún 
    // 3) Se trata de un archivo .png y tenemos un envío de email pendiente que la utiliza porque ha fallado el primer intento
    // 4) Su petición correspondiente ha sido satisfecha pero no se ha realizado todavía el primer intento
    //    de envío del correo o la transferencia al cliente para que lo descargue desde su navegador
    //    (la petición tendrá activado el flag "nonDeletableFile")


    // Descartar 1)
    if (!mongoose.isValidObjectId(parse(file).name)) {
      return;
    }

    const id = parse(file).name;

    let fileStillNeeded = null;
    try {
      // Descartar 2), 3) y 4)
      fileStillNeeded = (await Request.exists({
        _id: id,
        $or: [
          { status: { $ne: "fulfilled" } },
          { nonDeletableFile: true }
        ]
      }))
      ||
      ((extname(file) === ".png") && (await PendingEmail.exists({ _id: id, status: { $ne: "fulfilled" } })));

    } catch (error) {
      console.error(`Error al consultar id ${id} en la base de datos: ${error}`.red);
      return;
    }

    if (!fileStillNeeded) {
      try {
        unlinkSync(`${tempDir}/${file}`);
        console.log(`Archivo ${file} borrado exitosamente.`.yellow);
      } catch (error) {
        console.error(`Error al intentar borrar el archivo ${file}. ${error}`.red);
      }
    }
  });

  console.log("Comprobación de archivos temporales innecesarios finalizada".bold.yellow);
};

export { setUpCleanupInterval };
