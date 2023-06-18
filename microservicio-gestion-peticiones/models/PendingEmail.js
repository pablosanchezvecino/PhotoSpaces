import { Schema, model } from "mongoose";

// Esquema para trabajar con la colección de emails pendientes en MongoDB

const PendingEmailSchema = Schema(
  {
    email: {
      type: String,
      require: true
    },
    pngFileContent: {
      type: Buffer,
      require: true
    }
  },
  { 
    collection: "pendingEmails",
    optimisticConcurrency: true 
  }
);

export default model("PendingEmail", PendingEmailSchema);