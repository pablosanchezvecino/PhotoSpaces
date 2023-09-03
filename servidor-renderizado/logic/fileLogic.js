import path from "path";

// Funciones relacionadas con los archivos

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

export { mimeTypeToExtension, extensionToMimeType, extensionFromFilename };
