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
                apiKey: "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" ,
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
            console.log('Something went wrong')
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


module.exports={routeHandler}