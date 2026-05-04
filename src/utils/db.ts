import mongoose from "mongoose";


const connectDb = async () => {
  try {
    const connectionInstance = await mongoose.connect(
      process.env.MONGODB_URL as string,
    );
    console.log(`Connected to MongoDB: ${connectionInstance.connection.host}`);
  } catch (error) {
    console.log(`MongoDb connection failed : ${error}`);
    process.exit(1);
  }
};

export default connectDb;
