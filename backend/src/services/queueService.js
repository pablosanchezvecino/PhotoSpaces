import { requestQueue } from "../../app.js";

export async function checkQueue(req, res, next) {
  try {
    // Devuelve la cantidad de peticiones esperando en cola
    res.status(200).json(requestQueue.queue.getLength());
  } catch (err) {
    next(err);
  }
}
