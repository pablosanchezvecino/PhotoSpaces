// Variables y funciones relacionadas con el tiempo

const msInADay = 24 * 3600 * 1000;

// Espera tantos milisegundos como indique el parámetro ms
const wait = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export { wait, msInADay };