
// Funciones para conversiones entre unidades y de un formato a otro

const msToTime = (duration) => {
  if (!duration && duration !== 0) {
    return "N/A";
  } else {
    let seconds = Math.floor((duration / 1000) % 60),
      minutes = Math.floor((duration / (1000 * 60)) % 60),
      hours = Math.floor(duration / (1000 * 60 * 60));

    hours = hours < 10 ? "0" + hours : hours;
    minutes = minutes < 10 ? "0" + minutes : minutes;
    seconds = seconds < 10 ? "0" + seconds : seconds;

    return hours + ":" + minutes + ":" + seconds;
  }
};

const bytesToSize = (bytes) => {
  const kibibyte = 1024;
  const mebibyte = kibibyte * 1024;
  const gibibyte = mebibyte * 1024;
  const tebibyte = gibibyte * 1024;

  if (bytes < kibibyte) {
    return bytes.toFixed(2) + " B";
  } else if (bytes < mebibyte) {
    const kibibytes = bytes / kibibyte;
    return kibibytes.toFixed(2) + " KiB";
  } else if (bytes < gibibyte) {
    const mebibytes = bytes / mebibyte;
    return mebibytes.toFixed(2) + " MiB";
  } else if (bytes < tebibyte) {
    const gibibytes = bytes / gibibyte;
    return gibibytes.toFixed(2) + " GiB";
  } else {
    const tebibytes = bytes / tebibyte;
    return tebibytes.toFixed(2) + " TiB";
  }
};

export { msToTime, bytesToSize };
