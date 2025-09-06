import mongoose from "mongoose";

const fileSchema = new mongoose.Schema(
  {
    fileName: {
      type: String,
    },
    path: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
    },
    mimetype: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

const File = mongoose.model("File", fileSchema);

export default File;
