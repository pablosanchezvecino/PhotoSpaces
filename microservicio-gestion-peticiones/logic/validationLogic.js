import { validateBytes } from "gltf-validator";
import isEmail from "validator/lib/isEmail.js";
import { readFileSync } from "fs";

// Funciones relacionadas con la validación de las peticiones entrantes

// Validación email
const isValidEmail = (email) => {
  return isEmail(email);
};

// Validación archivos escenas 3D
const isValidModel = async (filename) => {
  try {
    await validateBytes(new Uint8Array(readFileSync(`./temp/${filename}`)));
    return true;
  } catch (error) {
    console.error(`Error al validar archivo. ${error}`.red);
    return false;
  }
};

// Validar valor recibido para el nivel de compresión con Draco
// (debe ser un entero entre 0 y 10)
const isValidDracoCompressionLevel = (dracoCompressionLevel) => {
  if (dracoCompressionLevel.includes(".") || isNaN(parseInt(dracoCompressionLevel))) {
    return false;
  }
  dracoCompressionLevel = parseInt(dracoCompressionLevel);
  return dracoCompressionLevel >= 0 && dracoCompressionLevel <= 10;
};

// Validar valor recibido para la etiqueta de la petición
// (debe tener una longitud menor o igual a 20)
const isValidRequestLabel = (label) => {
  return label.length <= 20;
};

export { isValidEmail, isValidModel, isValidDracoCompressionLevel, isValidRequestLabel };

