import multer from "multer";

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./temp");
  },
  filename: function (req, file, cb) {
    cb(null, `${req.body.requestId}.gltf`);
  }
});
    
const upload = multer({ storage: storage });

export { upload };