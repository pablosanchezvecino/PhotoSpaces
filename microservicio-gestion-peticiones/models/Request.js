const { Schema, model } = require("mongoose");

const QuaternionSchema = new Schema({
  _id : false,
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
  _id : false,
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
  _id : false,
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
  motor: {
    type: String,
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


const RequestSchema = Schema({
  status: {
    type: String,
    require: true,
  },
  queuePosition: {
    type: Number,
    require: false,
  },
  queueStartTime: {
    type: Date,
    require: false,
  },
  processingStartTime: {
    type: Date,
    require: false,
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
  parameters: {
    type: ParametersSchema,
    require: true,
  },
});

module.exports = model("Request", RequestSchema);
