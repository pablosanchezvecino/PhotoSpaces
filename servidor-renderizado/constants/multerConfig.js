import { mimeTypeToExtension } from "../logic/fileLogic.js";
import multer from "multer";


const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./temp");
  },
  filename: function (req, file, cb) {console.log(file)
    cb(null, `${req.body.requestId}${mimeTypeToExtension(file.mimetype)}`);
  }
});
    
const upload = multer({ storage: storage });

export { upload };