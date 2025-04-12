const { TwitterApi } = require('twitter-api-v2');
const cron = require('node-cron');
const crypto = require('crypto');
const {routeHandler} =require("./route_handler");


class XIntegration {
    constructor() {
        // Store credentials securely (use environment variables in production)
        this.client = new TwitterApi({
            appKey: "UR82RHWr5JtGq84fCvQA4H455",
            appSecret: "3y9ienayv5jbt5spvjqqVauhVXALZ5ggNiu0wAv4JrvQz3Y6KT",
            accessToken: "1898492499959721984-yWN7AccOmJXKMkrIIDkPzJz9PcsShf",
            accessSecret: "SPK2OPpCrygXfSt4YKODZgAbist7xotksCcRqSamfh5Qq"
        });

        // Bind context for cron job
        this.initializeXBot = this.initializeXBot.bind(this);
    }

    generateRandomId() {
        return crypto.randomBytes(12).toString("hex");
    }

     sanitizeText(txt) {
        return txt
          .replace(/[^\w\s.,!?']/g, '') // Remove problematic chars
          .substring(0, 100) // Hard limit
          .trim();
      }

// Check for mentions every 60 seconds
 startListeningForTags(){
    setInterval(() => this.checkMentions(), 60000);
    console.log("🔍 Polling for mentions every 60 seconds...");
  }

  async checkMentions(){
    try {
      const mentions = await this.client.v2.search(
        `@${this.BOT_USERNAME} -is:retweet`,
        {
          'tweet.fields': ['conversation_id'],
          since_id: this.lastCheckedId,
          max_results: 10
        }
      );

      if (mentions.data?.length) {
        this.lastCheckedId = mentions.meta.newest_id;
        for (const tweet of mentions.data) {
          await this.processMention(tweet);
        }
      }
    } catch (err) {
      console.error('Poll error:', err.message);
    }
  }

  async processMention(tweet) {
    try {
         const user = await this.client.v2.user(tweet.author_id);
      const cleanText = tweet.text
        .replace(new RegExp(`@${this.BOT_USERNAME}`, 'gi'), '')
        .trim();
    const LLM_MODEL_RESPONSE=new routeHandler().Johnny_model_function(this.generateRandomId(),cleanText)
      console.log(`💌 New mention from @${user.data.username}: "${cleanText}"`);
      // Generate response
      await this.client.v2.reply(`@${user.data.username}${LLM_MODEL_RESPONSE}`, tweet.id);
      console.log(`✅ Replied: ${response}`);

    } catch (err) {
      console.error('Reply failed:', err.message);
    }
  }

    // function to initialize X bot 
    async initializeXBot() {
        try {
            const LLM_model= new routeHandler();
          
            const define_llm_model = await LLM_model.Johnny_model_function(this.generateRandomId(),`
            make a short tweet about relationship  
            <RULES>
            - If the response isn't exactly 100 characters, rewrite it until perfect. Count carefully!  
            - Are exactly 150 characters long (count using JavaScript's [...str].length)
            Example:  "Web3 no be marriage counselor o! If your partner dey code Solana more than they dey notice you, better package yourself comot. 🙆‍♂️💪`);
          
            //Validate credentials first
            await this.client.v2.me(); 
            //  Generate and validate tweet content
            const tweetContent = define_llm_model;
            if (!tweetContent || tweetContent.length > 280) {
                throw new Error("Invalid tweet content");
            }
            // Post tweet with proper error handling
            const post = await this.client.v2.tweet({
                text:tweetContent
            });
            console.log(define_llm_model.length,define_llm_model)
            console.log(`✅ Tweeted: https://twitter.com/user/status/${post.data.id}`);
        } catch (err) {
            console.error(`[ERROR ${Date.now()}]`, {
                code: err.code,
                message: err.message,
                rateLimit: err.rateLimit || 'N/A',
                stack: err.stack
            });
        }
    }

    // function for tweeting post 
    startTweeting() {
        // Schedule every 7 hours
        cron.schedule('0 */7 * * *', this.initializeXBot, { 
            scheduled: true,
            timezone: 'UTC'
        });
        
        // Initial immediate tweet
        this.initializeXBot();
        console.log(`[${new Date().toISOString()}] X bot initialized`);
    }
}

module.exports = { XIntegration };