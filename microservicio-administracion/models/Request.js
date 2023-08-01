import { Schema, model } from "mongoose";

const QuaternionSchema = new Schema({
  _id: false,
  _x: {
    type: Number,
    required: true,
  },
  _y: {
    type: Number,
    required: true,
  },
  _z: {
    type: Number,
    required: true,
  },
  _w: {
    type: Number,
    required: true,
  },
});

const LocationSchema = new Schema({
  _id: false,
  x: {
    type: Number,
    required: true,
  },
  y: {
    type: Number,
    required: true,
  },
  z: {
    type: Number,
    required: true,
  },
});

const ParametersSchema = new Schema({
  _id: false,
  resolution: {
    type: String,
    enum: ["480p", "720p", "1080p", "1440p", "2160p"],
    required: true,
  },
  lens: {
    type: Number,
    required: true,
  },
  clip_start: {
    type: Number,
    required: true,
  },
  clip_end: {
    type: Number,
    required: true,
  },
  location: {
    type: LocationSchema,
    required: true,
  },
  qua: {
    type: QuaternionSchema,
    required: true,
  },
  engine: {
    type: String,
    enum: ["CYCLES", "BLENDER_EEVEE"],
    required: true,
  },
  gtao: {
    type: Boolean,
    required: true,
  },
  bloom: {
    type: Boolean,
    required: true,
  },
  ssr: {
    type: Boolean,
    required: true,
  },
});

const RequestSchema = Schema(
  {
    status: {
      type: String,
      enum: ["enqueued", "processing", "fulfilled"],
      require: true,
    },
    fileExtension: {
      type: String,
      enum: [".gltf", ".glb", ".drc"],
      require: true,
    },
    fileSize: {
      type: Number,
      min: 0,
      require: true
    },
    queueStartTime: {
      type: Date,
      require: false,
    },
    processingStartTime: {
      type: Date,
      require: false,
    },
    processingEndTime: {
      type: Date,
      require: false,
    },
    totalBlenderTime: {
      type: Number,
      min: 0,
      require: false
    },
    estimatedRemainingProcessingTime: {
      type: Number,
      require: false,
    },
    assignedServer: {
      type: String,
      require: false,
    },
    clientIp: {
      type: String,
      require: true,
    },
    requestLabel: {
      type: String,
      require: false,
    },
    parameters: {
      type: ParametersSchema,
      require: true,
    },
    email: {
      type: String,
      require: false,
    },
    sentFile: {
      type: Boolean,
      require: true
    },
    transferTime: {
      type: Number,
      require: false
    },
    nonDeletableFile: {
      type: Boolean,
      require: false
    }
  },
  { optimisticConcurrency: true }
);

RequestSchema.index({ queueStartTime: 1 });

export default model("Request", RequestSchema);