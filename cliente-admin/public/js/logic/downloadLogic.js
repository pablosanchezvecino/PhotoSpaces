import { administrationMicroserviceUrl } from "../constants/parameters.js";

const downloadRenderedImage = (id) => {
  const anchor = document.createElement("a");
  anchor.href = `${administrationMicroserviceUrl}/requests/${id}/rendered-image`;
  anchor.download = `${id}.png`;
  document.body.appendChild(anchor);
  anchor.click();
};

export { downloadRenderedImage };