// Enumerado con los posibles estados del servidor de renderizado
const ServerStates = Object.freeze({
  idle: Symbol("idle"),
  busy: Symbol("busy"),
  disabled: Symbol("disabled"),
});

module.exports = ServerStates;
