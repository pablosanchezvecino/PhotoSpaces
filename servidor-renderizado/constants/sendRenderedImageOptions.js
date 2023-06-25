
// Opciones para que funcione correctamente el
// envío de la imagen renderizada al microservicio

const options = {
  root: "./temp/",
  dotfiles: "deny",
  headers: {
    "x-timestamp": Date.now(),
    "x-sent": true,
  },
};

export { options };