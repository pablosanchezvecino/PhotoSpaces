import { Schema, model } from "mongoose";

const ServerSchema = Schema({
  name: {
    type: String,
    require: true,
  },
  ip: {
    type: String,
    require: true,
  },
  status: {
    type: String,
    require: true,
  },
  os: {
    type: String,
    require: true,
  },
  cpu: {
    type: String,
    require: true,
  },
  gpu: {
    type: String,
    require: true,
  },
  blenderVersion: {
    type: String,
    require: true,
  },
  registrationDate: {
    type: Date,
    require: true,
  },
  timeSpentOnRenderTest: {
    type: Number,
    require: true,
  },
});

export default model("Server", ServerSchema);
