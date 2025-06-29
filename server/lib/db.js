import mongoose, { mongo } from "mongoose";


//Function to connect to the mongodb database
export const connectDB=async()=>{
    try{
        mongoose.connection.on('connected',()=>console.log('Database Connected')) //event listener on
        await mongoose.connect(`${process.env.MONGODB_URI}Chat_Application`)

    }catch(error){
        console.log(error)

    }
}