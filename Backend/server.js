// const dns = require("dns");
// dns.setServers(["8.8.8.8", "8.8.4.4"]);
require("dotenv").config()
const app = require("./src/app")
const connectToDB = require("./src/config/database")
const invokedGeminiAi = require("./src/services/ai.service")
// const {resume, selfDescription, jobDescription} = require("./src/services/temp")
// const generateInterviewReport = require("./src/services/ai.service")
connectToDB()
// invokedGeminiAi()
// generateInterviewReport ({resume, selfDescription, jobDescription})

app.listen(3000,()=>
{
    console.log("Server is running on port 3000")
})
