
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

const extractTotalBlenderTimeMs = (data) => {
  const totalBlenderTimeString = data
    .toString()
    .split("Time: ")[1]
    .slice(0, 8);

  const [minutes, seconds] = totalBlenderTimeString.split(":").map(Number);

  const milliseconds = (minutes * 60 + seconds) * 1000;
  return milliseconds;
};

export { extractRemainingTimeMs, extractTotalBlenderTimeMs };
