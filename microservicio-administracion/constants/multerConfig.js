import multer from "multer";

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./temp");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.params.id}.png`);
  }
});
    
const upload = multer({ 
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "image/png") {
      cb(null, true); // Aceptar el archivo
    } else {
      cb(new Error("Tipo MIME del archivo no permitido")); // Rechazar el archivo
    }
  },
});

export { upload };