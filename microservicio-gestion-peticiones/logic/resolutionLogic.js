
const resolutionToPixelCount = (resolution) => {
  switch (resolution) {
  case "480p":
    return 854 * 480;
  case "720p":
    return 1280 * 720;
  case "1080p":
    return 1920 * 1080;
  case "1440p":
    return 2560 * 1440;
  case "2160p":
    return 3840 * 2160;
  default:
    throw new Error(`Recibido parámetro no válido (${resolution})"`);
  }
};

const resolutionToRatioWithRespectTo1080p = (resolution) => {
  const _1080pPixelCount = 1920 * 1080;
  let resolutionPixelCount = null;
  
  switch (resolution) {
  case "480p":
    resolutionPixelCount = 854 * 480;
    break;
  case "720p":
    resolutionPixelCount = 1280 * 720;
    break;
  case "1080p":
    resolutionPixelCount = 1920 * 1080;
    break;
  case "1440p":
    resolutionPixelCount = 2560 * 1440;
    break;
  case "2160p":
    resolutionPixelCount = 3840 * 2160;
    break;
  default:
    throw new Error(`Recibido parámetro no válido (${resolution})"`);
  }

  return resolutionPixelCount / _1080pPixelCount;
};

export { resolutionToPixelCount, resolutionToRatioWithRespectTo1080p };