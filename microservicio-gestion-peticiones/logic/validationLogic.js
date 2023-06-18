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

export { isValidEmail, isValidModel };