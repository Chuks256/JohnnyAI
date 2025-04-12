// define modules 
require("dotenv").config();
const expressModule = require("express");
const app=expressModule();
const BodyParser=require("body-parser");
const CorsModule = require("cors");
const port =process.env.PORT || 3056;
const {Telegram_integration} = require("./Handler/telegram_integration");
const {routeHandler}=require("./Handler/route_handler");
const timestamp = Date.now();
// const {XIntegration} = require("./Handler/X_integration");

// define middlewares 
app.use(CorsModule());
app.use(BodyParser.json())
app.use(expressModule.json())
app.use(BodyParser.urlencoded({extended:false}));

// define functions
const route_handler = new routeHandler(); 

new Telegram_integration().initialise_telegram_bot(); // bot should start receiving and sending messages every 7 hours 
// new XIntegration().startListeningForTags(); // bot should listen for tags 
// new XIntegration().startTweeting() // bot should start tweeting every 7 hours 

// define api route 
app.get("/api/isServerOnline",async(req,res)=>{
    await res.status(200).json({msg:"[+] Server currently active [+]"})
})


// Webhook endpoint
app.post(`/webhook/${process.env.TELEGRAM_TOKEN}`, new Telegram_integration().startProcessUpdate);
  

app.post('/api/getUserPrompt',route_handler.processUserPrompt)


app.listen(port ,async()=>{
console.log(`[${timestamp}] Api Actively Server running....`)
if(process.env.NODE_ENV==="production"){
    await new Telegram_integration().setupWebhook()
}
});