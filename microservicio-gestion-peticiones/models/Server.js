import { Schema, model } from "mongoose";

// Esquema para trabajar con la colección de servidores de renderizado en MongoDB

const ServerSchema = Schema(
  {
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
      enum: ["idle", "busy", "disabled"],
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
      min: 0,
      require: true,
    }
  },
  { optimisticConcurrency: true }
);

export default model("Server", ServerSchema);