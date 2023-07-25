import { requestHandlingMicroserviceHost, requestHandlingMicroservicePort } from "../env.js";
import { writeFileSync } from "fs";

// Descargar la imagen cuando esta ya ha sido renderizada 
// y almacenarla en el directorio /out
const downloadImage = async (requestId) => {
  try {
    const response = await fetch(
      `http://${requestHandlingMicroserviceHost}:${requestHandlingMicroservicePort}/requests/${requestId}/rendered-image`,
      { method: "GET" }
    );
  
    if (response.ok) {
      writeFileSync(`./out/${requestId}.png`, Buffer.from(await response.arrayBuffer()), "binary");
      console.log(`Archivo ${requestId}.png generado en el directorio out`.bold.magenta);
    } else {
      console.error(`Obtenido código ${response.status} al intentar descargar la imagen renderizada. ${(await response.json()).error}`.red);
    }
  
  } catch (error) {
    console.error(error);
  }
};

export { downloadImage };