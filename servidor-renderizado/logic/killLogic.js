import { exec } from "child_process";

// Funciones encargadas de finalizar el proceso de Blender 
// cuando se intenta abortar el procesamiento en el sevidor

const killBlenderOnWindows = () => {
  return new Promise((resolve) => {
    exec("taskkill /im blender.exe /F", (error) => {
      if (error) {
        console.error(`No se encontró ningún proceso blender.exe en ejecución`).red;
      } else {
        console.log("Proceso blender.exe terminado".magenta);
      }
      resolve();
    });
  
  });
};
  
const killBlenderOnUnixBasedOs = () => {
  return new Promise((resolve) => {
    exec("pkill blender", (error) => {
      if (error) {
        console.error(`No se encontró ningún proceso blender en ejecución`.red);
      } else {
        console.log("Proceso blender terminado".magenta);
      }
      resolve();
    });
  
  });
};

export { killBlenderOnWindows, killBlenderOnUnixBasedOs };