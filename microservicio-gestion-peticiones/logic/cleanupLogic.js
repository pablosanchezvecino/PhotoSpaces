import PendingEmail from "../models/PendingEmail.js";
import { readdirSync, unlinkSync } from "fs";
import Request from "../models/Request.js";
import { parse, extname } from "path";

// Funciones relacionadas con la limpieza periódica de archivos temporales

const tempDir = "./temp";

// Iniciar ejecución periódica de la limpieza
const setUpCleanupInterval = () => setInterval(performCleanup, process.env.CLEANUP_INTERVAL_MS);

// Eliminar todos los archivos de la carpeta /temp que ya no sean necesarios
const performCleanup = () => {
  console.log("Comprobando archivos temporales innecesarios...".bold.yellow);

  let files = null;
  try {
    files = readdirSync(tempDir);
  } catch (error) {
    console.error(`Error al leer el directorio de archivos temporales: ${error}`.red);
    return;
  }

  files.forEach(async (file) => {
    const id = parse(file).name;

    // No podemos eliminar el archivo si tenemos guardada en BD su petición 
    // correspondiente y esta no ha sido satisfecha aún o si es un archivo 
    // .png y tenemos un envío de email pendiente que la utilice
    let fileStillNeeded = null;
    try {
      fileStillNeeded = (await Request.exists({ _id: id, status: { $ne: "fulfilled" } }))
                        ||
                        ((extname(file) === ".png") && (await PendingEmail.exists({ _id: id, status: { $ne: "fulfilled" } })) );
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
