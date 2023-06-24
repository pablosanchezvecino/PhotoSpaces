import { mimeTypeToExtension } from "../logic/fileLogic.js";
import multer from "multer";

// Configuración de multer para la recepción de archivos

// Almacenar en la carpeta /temp con un nombre arbitrario 
// que posteriormente será sustituido por el id de la petición
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./temp");
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname + "-" + Date.now() + mimeTypeToExtension(file.mimetype));
  }
});
    
const upload = multer({ storage: storage });

export { upload };