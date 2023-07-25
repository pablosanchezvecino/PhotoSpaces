import { mimeTypeToExtension } from "../logic/fileLogic.js";
import { allowedMimeTypes } from "./allowedMimeTypes.js";
import { maxFileSizeBytes } from "../env.js";
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
    
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Aceptar el archivo
    } else {
      cb(new Error("Tipo MIME del archivo no permitido")); // Rechazar el archivo
    }
  },
  limits: {
    fileSize: ((Number) (maxFileSizeBytes))
  }
});

export { upload };