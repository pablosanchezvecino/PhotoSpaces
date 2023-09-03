import gltfPipeline from "gltf-pipeline";
import fsExtra from "fs-extra";
import path from "path";


const mimeTypeToExtension = (mimeType) => {
  switch (mimeType) {

  case "model/gltf+json":
    return ".gltf";

  case "model/gltf-binary":
    return ".glb";

  case "model/vnd.gltf.draco":
    return ".drc";

  case "text/plain":
    return ".txt";

  default:
    throw new Error(`Recibido MIME Type no válido (${mimeType})`);
  }
};

const extensionToMimeType = (extension) => {
  switch (extension) {

  case ".gltf":
    return "model/gltf+json";
      
  case ".glb":
    return "model/gltf-binary";
      
  case ".drc":
    return "model/vnd.gltf.draco";

  case ".txt":
    return "text/plain";
      
  default:
    throw new Error(`Recibida extensión no válida (${extension})`);
  }
};

const extensionFromFilename = (filename) => {
  return path.extname(filename);
};

const generateGltfFromGlb = async (fileRoute) => {
  const glb = fsExtra.readFileSync(fileRoute);
  const results = await gltfPipeline.glbToGltf(glb);
  fsExtra.writeJsonSync(`./temp/${path.basename(fileRoute, path.extname(fileRoute))}.gltf`, results.gltf);
};


const generateGlbFromGltf = async (fileRoute) => {
  const gltf = fsExtra.readJsonSync(fileRoute);
  const results = await gltfPipeline.gltfToGlb(gltf);
  fsExtra.writeFileSync(`./temp/${path.basename(fileRoute, path.extname(fileRoute))}.glb`, results.glb);
};

const generateDracoFromGltf = async (fileRoute, dracoCompressionLevel) => {
  const gltf = fsExtra.readJsonSync(fileRoute);
  const options = {
    dracoOptions: {
      compressionLevel: dracoCompressionLevel
    },
  };
  const results = await gltfPipeline.processGltf(gltf, options);
  fsExtra.writeJsonSync(`./temp/${path.basename(fileRoute, path.extname(fileRoute))}.drc`, results.gltf);
};



export { 
  mimeTypeToExtension, 
  extensionToMimeType,
  extensionFromFilename,
  generateGlbFromGltf,
  generateGltfFromGlb,
  generateDracoFromGltf
};
