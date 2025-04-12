
require("dotenv").config();
const OpenAiModule=require("openai")
const MemoryHandler=new Map();
const {LLM_rules} = require("../config/llm_rules");


// define function 
const _LLM_rules = new LLM_rules();

class routeHandler{

    async Johnny_model_function(userId="",msg=""){
        if(! MemoryHandler.has(userId)){
            MemoryHandler.set(userId,{
                messages:[
                    {
                        role:"system",
                        content:_LLM_rules.define_rules().content
                    }
                ]
            })
        }

        const getUserData = MemoryHandler.get(userId);
        getUserData.messages.push( {
            role:'user',
            content:msg.toLowerCase()
        })
        getUserData.lastActive=Date.now()

        setInterval(() => {
            const now = Date.now();
            const oneMinuteAgo = now - 60 * 1000;
          
            MemoryHandler.forEach((data, userId) => {
              if (data.lastActive < oneMinuteAgo) {
                MemoryHandler.delete(userId);
                console.log(`Deleted inactive chat: ${userId}`);
              }
            });
          }, 30 * 1000);

        try{
            const openai_module = new OpenAiModule({
                baseURL: 'https://openrouter.ai/api/v1',
                apiKey:"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" || process.env.OPEN_ROUTER_API_KEY
               })

            const llm_model = await openai_module.chat.completions.create({
                model:"mistralai/mistral-7b-instruct",
                messages:getUserData.messages
               })
        
               const agent_response= await llm_model.choices[0].message
               await getUserData.messages.push(JSON.stringify(agent_response))
               return agent_response.content;
        }
        catch(exception){
            console.log('Something went wrong',exception)
        }
    }


    //  API ROUTE for web and mobile 
    async verify_user(req,res){}

    async processUserPrompt(req,res){
        const {userId,prompt}=req.body;
        const llm_response = await this.Johnny_model_function(userId,prompt);
        res.status(200).json(llm_response)
    }



}


let l=new routeHandler().Johnny_model_function('rrrr','hello')
console.log(l)

module.exports={routeHandler}