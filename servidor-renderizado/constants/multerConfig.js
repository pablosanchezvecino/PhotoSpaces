import { mimeTypeToExtension } from "../logic/fileLogic.js";
import multer from "multer";


const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./temp");
  },
  filename: (req, file, cb) => {
    cb(null, `${req.body.requestId}${mimeTypeToExtension(file.mimetype)}`);
  }
});
    
const upload = multer({ storage: storage });

export { upload };