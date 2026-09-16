import { app } from "./app.js";
import dotenv from 'dotenv';
import connectDB from "./config/db.js";
import dns from 'dns';

dns.setServers(['1.1.1.1', '8.8.8.8']);
dotenv.config({
    path: "./.env"
})

const PORT = process.env.PORT || 5000

connectDB().
then(()=>{
    app.listen(PORT,()=>{
        console.log(`console is running at the port: ${PORT}`)
    })
})
.catch((err)=>{
    console.log("mongodb is not connected properly",err);
})
