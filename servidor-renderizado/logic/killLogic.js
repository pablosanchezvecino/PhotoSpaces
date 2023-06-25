import { exec } from "child_process";

// Funciones encargadas de finalizar el proceso de Blender 
// cuando se intenta abortar el procesamiento en el sevidor

const killBlenderOnWindows = () => {
  return new Promise((resolve, reject) => {
    exec("taskkill /im blender.exe /F", (error) => {
      if (error) {
        reject(`Error al matar el proceso blender.exe: ${error.message}`);
      }
      
      console.log("Proceso blender.exe terminado".magenta);
      resolve();
    });
  
  });
};
  
const killBlenderOnUnixBasedOs = () => {
  return new Promise((resolve, reject) => {
    exec("pkill blender", (error) => {
      if (error) {
        reject(`Error al matar el proceso blender: ${error.message}`);
      }
      
      console.log("Proceso blender terminado".magenta);
      resolve();
    });
  
  });
};

export { killBlenderOnWindows, killBlenderOnUnixBasedOs };