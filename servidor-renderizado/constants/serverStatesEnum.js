// Enumerado con los posibles estados del servidor de renderizado
const ServerStates = Object.freeze({
  unbound: Symbol("unbound"),
  idle: Symbol("idle"),
  busy: Symbol("busy"),
  disabled: Symbol("disabled"),
});

export default ServerStates;
