import { getTerminationInput } from "./logic/terminationLogic.js";
import { getDracoCompressionLevel } from "./logic/dracoLogic.js";
import { getParameters } from "./logic/parametersLogic.js";
import { requestHandlingMicroserviceUrl } from "./env.js";
import { printAsciiArt } from "./logic/asciiArtLogic.js";
import { requestPolling } from "./logic/pollingLogic.js";
import { downloadImage } from "./logic/downloadLogic.js";
import { getEmail } from "./logic/emailLogic.js";
import { getFile } from "./logic/fileLogic.js";
import dotenv from "dotenv";
import "colors";

process.noDeprecation = true;

dotenv.config();

printAsciiArt();

let terminate = false;

while (!terminate) {

  // Parámetros
  const parameters = await getParameters();

  // Archivo
  const [file, mimeType] = await getFile();


  // Compresión con Draco (opcional)
  let dracoCompressionLevel = null;

  if (mimeType !== "text/plain") {

    dracoCompressionLevel = await getDracoCompressionLevel();

    if (!dracoCompressionLevel && dracoCompressionLevel !== 0) {
      console.log("No se aplicará compresión con Draco\n".bold.magenta);
    } else {
      console.log(`Se aplicará el nivel ${dracoCompressionLevel} de compresión con Draco\n`.bold.magenta);
    }

  }

  // Solicitar email (opcional)
  const email = await getEmail();

  if (!email) {
    console.log("La imagen renderizada se almacenará en el directorio out\n".bold.magenta);
  } else {
    console.log(`La imagen renderizada se enviará a ${email}\n`.bold.magenta);
  }

  // POST /render
  const formData = new FormData();

  formData.append("model", new Blob([file], { type: mimeType }));

  formData.append("data", JSON.stringify(parameters));

  if (email) {
    formData.append("email", email);
  }

  if (dracoCompressionLevel) {
    formData.append("dracoCompressionLevel", dracoCompressionLevel);
  }

  console.log("Enviando petición al sistema...\n".bold.magenta);
  try {
    const response = await fetch(
      `${requestHandlingMicroserviceUrl}/requests`,
      {
        method: "POST",
        body: formData
      }
    );
  
    if (response.ok) {
      if (email) {
        console.log(`Petición recibida, en cuanto esté lista se enviará a ${email}`.bold.green);
      } else {
        const jsonContent = await response.json();
        console.log(jsonContent);
        await requestPolling(jsonContent.requestId, jsonContent.requestStatus);
        await downloadImage(jsonContent.requestId);
      }
    } else {
      console.error(`Obtenido código ${response.status} al intentar enviar la petición al sistema: ${(await response.json()).error}`.red);
    }

  } catch (error) {
    console.log(`Error durante el envío de la petición. ${error}`.red);
  }

  terminate = await getTerminationInput();
}
