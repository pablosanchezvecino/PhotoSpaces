import readline from "readline";
import path from "path";
import fs from "fs";

const getFile = async () => {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
    terminal: false
  });
      
  let file = null;
  let mimeType = null;
  let valid = false;

  while (!valid) {

    try {
      [file, mimeType] = await new Promise((resolve, reject) => {
        rl.question("\nIntroduzca ruta del fichero con la escena 3D:\n".bold.magenta,
          (input) => {
            try {
              file = fs.readFileSync(input);
              console.log("Fichero localizado".bold.magenta);
              const extension = path.extname(input);
              valid = [".gltf", ".glb", ".txt"].includes(extension);
              if (valid) {
                const mimeType = (extension === ".gltf") ? "model/gltf+json" : 
                                 (extension === ".glb") ? "model/gltf-binary" : "text/plain" ;
                resolve([file, mimeType]);
              } else {
                console.error("Solo se permiten archivos .gltf, .glb y .txt".red);
                reject();
              }
            } catch (error) {
              console.error("Ruta no válida".red);
              reject();
            }
          }
        );
      });
      
    } catch (error) {
      valid = false;
    }
    
  }

  rl.close();
  return [file, mimeType];
};

export { getFile };