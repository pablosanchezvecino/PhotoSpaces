// Extrae el tiempo restante de la salida de Blender en ms
const extractRemainingTimeMs = (data) => {
  const remainingTimeString = data
    .toString()
    .split(" | ")[2]
    .replace("Remaining:", "");

  const [minutes, seconds] = remainingTimeString.split(":").map(Number);

  const milliseconds = (minutes * 60 + seconds) * 1000;
  return milliseconds;
};

export { extractRemainingTimeMs };
