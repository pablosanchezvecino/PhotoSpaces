// Funciones relacionadas con el tiempo

// Espera tantos milisegundos como indique el parámetro ms
const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export { wait };