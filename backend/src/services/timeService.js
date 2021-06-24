import { getTimeEstimation } from "../logic/timeLogic.js";

export async function totalEstimated(req, res, next) {
  try {
    // Obtiene el calculo de la estimación de tiempo, actualizada por /renderService
    res.status(200).json(getTimeEstimation());
  } catch (err) {
    next(err);
  }
}
