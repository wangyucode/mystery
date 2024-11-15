import fetch from "node-fetch";
import { startPrompt } from "./prompts.js";


export async function create(title, socket, io) {
    const data = {
        bot_id: "7437110083068215323",
        user_id: "wycode",
        stream: true,
        additional_messages: [
            {
                role: "user",
                content: startPrompt(title),
                content_type: "text",
            },
        ],
    };
    try {
        const res = await fetch("https://api.coze.cn/v3/chat", {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${process.env.KOUZI_API_KEY}`,
            },
            body: JSON.stringify(data),
        });
        let result = '';
        for await (const chunk of res.body) {
            const line = chunk.toString('utf-8');
            console.log(line);
            result += line;
        }
        console.log("result->", result);
    } catch (error) {
        console.error(error);
    }

}
