import mongoose from "mongoose";

let mongodb_instance = null;

export const connectDB = async () => {
  if (mongodb_instance) {
    return mongodb_instance;
  }

  try{
      mongodb_instance = await mongoose.connect(process.env.MONGODB_URI, { serverSelectionTimeoutMS: 5000 })
      console.log(`MongoDB connected: ${mongodb_instance.connection.host}`);
  }catch(err){
      mongodb_instance = null;
      console.error(`MongoDB connection error: ${err.message}`);
  }

  return mongodb_instance;
};