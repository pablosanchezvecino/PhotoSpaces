import { Schema, model } from "mongoose";
import dotenv from "dotenv";
import Server from "./models/Server.js";
dotenv.config();

// Esquema para trabajar con la colección de servidores de renderizado en MongoDB

const ServerTestSchema = Schema(
  {
    status: {
      type: String,
      enum: ["idle", "busy", "disabled"],
      require: true,
    },

    timeSpentOnRenderTest: {
      type: Number,
      min: 0,
      require: true,
    },
  },
  {
    collection: "serversTest",
  }
);

const ServerTest = model("ServerTest", ServerTestSchema);

import dbConnection from "./database/databaseConfig.js";
dbConnection();

// const hrStart = process.hrtime();

const startTime = Date.now();

console.log(
  await Server.find({ status: "idle" })
    .sort({ timeSpentOnRenderTest: 1 })
    .limit(1)
);
const endTime = Date.now();
console.log(endTime - startTime);
// const rEnd = process.hrtime(hrStart);
process.exit()
// console.log(Math.round(rEnd[0] * 1000 + rEnd[1] / 1000000));
