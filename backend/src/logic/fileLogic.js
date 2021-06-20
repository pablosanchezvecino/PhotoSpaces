import { writeFileSync, unlink } from "fs";

export function saveTempFile(model) {
  writeFileSync(`./public/${model.md5}.gltf`, Buffer.from(model.data));
}

export function deleteTempFiles(fileName) {
  unlink(`./public/${fileName}.gltf`, (err) => {
    if (err) throw err;
  });
  unlink(`./public/${fileName}.png`, (err) => {
    if (err) throw err;
  });
}
