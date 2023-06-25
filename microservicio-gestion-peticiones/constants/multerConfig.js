import { mimeTypeToExtension } from "../logic/fileLogic.js";
import multer from "multer";
import dotenv from "dotenv";

dotenv.config();
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
    const allowedMimeTypes = [
      "model/gltf+json",
      "model/gltf-binary",
      "model/vnd.gltf.draco"
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
      cb(null, true); // Aceptar el archivo
    } else {
      cb(new Error("Tipo MIME del archivo no permitido")); // Rechazar el archivo
    }
  },
  limits: {
    fileSize: ((Number) (process.env.MAX_FILE_SIZE_BYTES)) || Infinity
  }
});

export { upload };