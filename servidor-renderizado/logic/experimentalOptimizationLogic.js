import puppeteer from "puppeteer";
import { port } from "../env.js"
import path from "path";
import fs from "fs";

const generateGltfFromTxt = async (requestId) => {

  try {

    fs.copyFileSync(`./temp/${requestId}.txt`, './public/assets/escena.txt');

    const browser = await puppeteer.launch({
      headless: true
    });
    
    const page = await browser.newPage();

    page.on('console', (message) => {
      // console.log(`${message.text()}`.yellow);
      if (message.type() === 'log') {
        console.log(`${message.text()}`.green);
      } else if (message.type() === 'warning') {
        console.warn(`${message.text()}`.yellow);
      } else {
        console.error(`${message.text()}`.red);
      }
    });
  
    const client = await page.target().createCDPSession();
  
    await client.send("Page.setDownloadBehavior", {
      behavior: "allow",
      downloadPath: path.resolve("./temp"),
    });
  
    await page.goto(`http://localhost:${port}`);
  
    await waitForGltfGeneration();

    browser.close();
  

  } catch (error) {
    throw new Error(`Error al generar fichero .gltf a partir del fichero .txt. ${error}`);
  }

  try {
    fs.renameSync("./temp/scene.gltf", `./temp/${requestId}.gltf`);
  } catch (error) {
    throw new Error(`Error al renombrar escena GLTF generada a partir del fichero .txt`);
  }

  try {
    fs.unlinkSync(`./temp/${requestId}.txt`);
    fs.unlinkSync('./public/assets/escena.txt');
    console.log("Ficheros .txt eliminados exitosamente".magenta);
  } catch (error) {
    console.error(`Error al intentar eliminar ficheros .txt. ${error}`.red);
  }
};

// Esperar a que se genere el fichero.gltf antes de cerrar el navegador
const waitForGltfGeneration = async (requestId) => {

  return new Promise((resolve => {

    const waitingInterval = setInterval(() => {
      if (fs.existsSync("./temp/scene.gltf")) {
        clearInterval(waitingInterval);
        resolve();
      }
    }, 500);


  }));

};

export { generateGltfFromTxt };