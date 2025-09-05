import mongoose from "mongoose";

const textSchema = new mongoose.Schema(
  {
    text: {
      type: String,
    },
    content_url: {
      type: String
    },
    url: {
      type: String,
    },
    isEncrypted: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const Text = mongoose.model("Text", textSchema);

export default Text;
