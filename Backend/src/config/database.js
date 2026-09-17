const mongoose = require("mongoose") 

async function connectToDB(){
    try {await mongoose.connect(process.env.MONGO_URI)
    console.log("Connected to Database")
        
    } catch (error) {
        console.error("Database connection failed:", error.message);
        // process.exit(1);
    }
}


module.exports = connectToDB;









