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
    },
    fulfilledRequestsCount: {
      type: Number,
      min: 0,
      require: true,
    },
    enqueuedRequestsCount: {
      type: Number,
      min: 0,
      require: true,
    },
    totalCyclesNeededTime: {
      type: Number,
      min: 0,
      require: true,
    },
    totalCyclesBlenderTime: {
      type: Number,
      min: 0,
      require: true,
    },
    totalCyclesProcessedBytes: {
      type: Number,
      min: 0,
      require: true,
    },
    cyclesProcessedBytesPerMillisecondOfNeededTime: {
      type: Number,
      min: 0,
      require: false,
    },
    totalEeveeNeededTime: {
      type: Number,
      min: 0,
      require: true,
    },
    totalEeveeBlenderTime: {
      type: Number,
      min: 0,
      require: true,
    },
    totalEeveeProcessedBytes: {
      type: Number,
      min: 0,
      require: true,
    },
    eeveeProcessedBytesPerMillisecondOfNeededTime: {
      type: Number,
      min: 0,
      require: false,
    }
  },
  { optimisticConcurrency: true }
);

export default model("Server", ServerSchema);