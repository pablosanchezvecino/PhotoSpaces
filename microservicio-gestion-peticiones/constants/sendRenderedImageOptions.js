// Opciones para que funcione correctamente el 
// envío de la imagen renderizada al cliente

const options = {
  root: "./",
  dotfiles: "deny",
  headers: {
    "x-timestamp": Date.now(),
    "x-sent": true,
  },
};

export { options };