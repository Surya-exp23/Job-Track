import mongoose from 'mongoose';
import DB_NAME from "../Constants.js";

const connectDB = async()=>{
    try {
        const connectionInstance = await mongoose.connect(`${process.env.MONGODB_URL}/${DB_NAME}`);
    } catch (error ) {
        console.log("mongodb connect error", error);
        process.exit(1);
    }
}

export default connectDB