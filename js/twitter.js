const fs = require("fs");
let Twitter = require('twitter');
require('dotenv').config();

let tw = new Twitter({
    consumer_key: process.env.consumer_key,
    consumer_secret: process.env.consumer_secret,
    access_token_key: process.env.access_token_key,
    access_token_secret: process.env.access_token_secret
});

const getTweet = async () => {
    const stream = await tw.stream('statuses/filter', {'track':'#ダイエット'});
    stream.on('data', async data => {
        try {
            let at = data.created_at;
            let text = data.text;
            let name = data.user.name;
            let ary = [at, name, text];
            fs.appendFile("text/result.txt", JSON.stringify(ary,undefined,1) + "\n", (err) => {
                if (err) throw err;
                console.log("正常に書き込みが完了しました");
                console.log(ary);
            });
        } catch (error) {
            console.log(error);
        }
    });
};

