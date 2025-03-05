import express from "express"
import cors from "cors"
import dotenv from 'dotenv';
import { jobApplicationRoutes } from './routes/jobApplicationRoutes.js'; 

// Load environment variables
dotenv.config();

//initialize express
const app = express();
app.use(cors());

//middleware for incoming requests
app.use(express.json())
app.use(express.urlencoded({extended:true}))

// Use routes
app.use("/api/job-application",jobApplicationRoutes)


//server running check
app.get("/", (req,res)=>{
    res.send("Backend application form running")
});

//start the server
const PORT = process.env.PORT || 5000;
app.listen(PORT,()=>{
    console.log(`Server running on port ${PORT}`)
})