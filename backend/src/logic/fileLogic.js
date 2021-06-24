import { writeFileSync, unlink } from "fs";

// Guardar el archivo temporalmente
export function saveTempFile(model) {
  writeFileSync(`./public/${model.md5}.gltf`, Buffer.from(model.data));
}

// Eliminar los archivos temporales
export function deleteTempFiles(fileName) {
  [".gltf", ".png"].map((format) => {
    unlink(`./public/${fileName}${format}`, (err) => {
      if (err) throw err;
    });
  });
}
