import { readdirSync, unlinkSync } from "fs";

const tempDir = "./temp";

// Elimina todos los archivos del directorio temp excepto renderTest.gltf
const performCleanup = () => {
  console.log("eliminando archivos temporales...".yellow);

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
    if (file !== "renderTest.gltf" ) {
      try {
        unlinkSync(`${tempDir}/${file}`);
        console.log(`Archivo ${file} eliminado exitosamente.`.yellow);
      } catch (error) {
        console.error(`Error al intentar borrar el archivo ${file}: ${error}`.red);
      }
    }
  });

};

export { performCleanup };
