const { Schema, model } = require("mongoose");

const RequestSchema = Schema({
  status: {
    type: String,
    require: true
  },
  queuePosition: {
    type: Number,
    require: false
  },
  queueStartTime: {
    type: Date,
    require: false
  },
  processingStartTime: {
    type: Date,
    require: false
  },
  processingEndTime: {
    type: Date,
    require: false
  },
  estimatedRemainingProcessingTime: {
    type: Number,
    require: false
  },
  assignedServer: {
    type: String,
    require: false
  },
  clientIp: {
    type: String,
    require: true
  }
});

module.exports = model("Request", RequestSchema)
