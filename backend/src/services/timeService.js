import { getTimeEstimation } from "../logic/timeLogic.js";

export async function totalEstimated(req, res, next) {
  try {
    res.status(200).json(getTimeEstimation());
  } catch (err) {
    next(err);
  }
}
