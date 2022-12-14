const { Telegraf } = require('telegraf');
const axios = require('axios');
require('dotenv').config();

const flags = {
    feedback_message: 0
}

const welcomeText = "Hello, Welcome to capy-bot! \n This bot makes your day better!";
const CAPYBARA_IMAGE_API_URL = "https://api.capy.lol";
const CAPYBARA_FACT_API_URL = "https://api.capybara-api.xyz";

const messageHandler = (ctx) => {
    if (flags.feedback_message) {
        ctx.reply('Thanks for the feedback!');
        sendFeedbackToAdmin(ctx);
        flags.feedback_message = 0;
    }
    else {
        ctx.reply("I didn't understand that");
    }
}

const sendCapybaraImage = (ctx) => {
    ctx.replyWithPhoto({ url: `${CAPYBARA_IMAGE_API_URL}/v1/capybara`})
}

const sendCapybaraFact = (ctx) => {
    axios.get(`${CAPYBARA_FACT_API_URL}/v1/facts/random`)
    .then(res => ctx.reply(res.data.fact))
    .catch(err  => ctx.reply('Researching Capybaras....'));
}

const sendFeedbackToAdmin = (ctx, isFromCommand) => {
    const senderName = `${ctx.message.from.first_name} ${ctx.message.from.last_name}`;
    const senderId = ctx.message.from.id;
    
    let feedbackMessage;
    if(isFromCommand) {
        feedbackMessage = ctx.message.text.split(' ');
        feedbackMessage.shift();
        feedbackMessage  = feedbackMessage.join(' ');
    }
    else {
        feedbackMessage = ctx.message.text;
    }
    
    bot.telegram.sendMessage(process.env.ADMIN_ID, `user = ${senderName} \nchat_id = ${senderId} \nsent the feedback =${feedbackMessage}`);
}

const handleGetFeedback = (ctx) => {
    let message = ctx.message.text;
    if(message.split(' ').length > 1) {
        ctx.reply('Thanks for the feedback!');
        sendFeedbackToAdmin(ctx, true);
    }
    else {
        flags.feedback_message = 1;
        ctx.reply('Listening To Feedback :)');
    }  
}

const initHerokuLaunchOptions = () => {
    if (process.env.MODE === 'prod') {
        return {
            webhook: {
                domain: `https://${process.env.HEROKU_APP_NAME}.herokuapp.com/${process.env.BOT_TOKEN}`,
                url: `/${process.env.BOT_TOKEN}`,
                port: process.env.PORT //Heroku adds this automatically
        }}    
    }
    return undefined;
}

const bot = new Telegraf(process.env.BOT_TOKEN);
bot.start((ctx) => ctx.reply(welcomeText));
bot.command('capybara', sendCapybaraImage);
bot.command('fact', sendCapybaraFact);
bot.command('send_feedback', handleGetFeedback);
bot.on('message', messageHandler)

const launchOptions = initHerokuLaunchOptions();
bot.launch(launchOptions);

console.log('Bot Running...');
// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))