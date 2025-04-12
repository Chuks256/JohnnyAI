
// define node modules 
require("dotenv").config();
const {routeHandler}=require("./route_handler")
const TelegramBot = require('node-telegram-bot-api');

// define functions and api key 
const LLM_ModelHandler = new routeHandler();
const TOKEN ="8103257952:AAHgCdU4pywzah_6_aL8GFO5u83xdO1PYMk" ;
const bot = new TelegramBot(TOKEN, { polling: true });


class Telegram_integration{

    constructor(){
        this.timestamp=Date.now();
    }

    initialise_telegram_bot(){
        console.log(`[${this.timestamp}]  [+] Telegram bot currently running ............. [+]`)

        bot.on("message",async(msg)=>{
            const userId=msg.chat.id;
        
            if(!msg.text || msg.text.startsWith("/")){
                const response = await LLM_ModelHandler.Johnny_model_function(userId,'Whats up');
                setTimeout(async()=>{
                    await bot.sendMessage(userId,`${response}`);
                },500)
            }


            try{
                if(msg.reply_to_message){
                bot.sendChatAction(userId,"typing");
                const LLm_response = await LLM_ModelHandler.Johnny_model_function(userId,msg.text);
                console.log(LLm_response)
                setTimeout(async () => {
                    await bot.sendMessage(userId, `${LLm_response}`,{
                        reply_to_message_id:msg.reply_to_message.message_id
                    });
                    console.log(LLm_response)
                  }, 1000);
                }
                else{
                    bot.sendChatAction(userId,"typing");
                    const _llm_response = await LLM_ModelHandler.Johnny_model_function(userId,msg.text)
                    setTimeout(async () => {
                        await bot.sendMessage(userId, `${_llm_response}`);
                        console.log(_llm_response)
                      }, 1000);
                }
            }
            catch(err){
                bot.sendMessage(userId,'ahh e be like network no dey ooo, wahala be like bicycle')
            }
        })

    }
}


// export module 
module.exports={Telegram_integration}