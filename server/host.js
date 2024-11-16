import OpenAI from "openai";
import * as prompts from "./prompts.js";
import { io } from "socket.io-client";

import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

// export async function create(title, socket, io) {
//     const data = {
//         bot_id: "7437110083068215323",
//         user_id: "wycode",
//         stream: true,
//         additional_messages: [
//             {
//                 role: "user",
//                 content: startPrompt(title),
//                 content_type: "text",
//             },
//         ],
//     };
//     try {
//         const res = await fetch("https://api.coze.cn/v3/chat", {
//             method: "POST",
//             headers: {
//                 "Content-Type": "application/json",
//                 "Authorization": `Bearer ${process.env.KOUZI_API_KEY}`,
//             },
//             body: JSON.stringify(data),
//         });
//         let result = '';
//         for await (const chunk of res.body) {
//             const line = chunk.toString('utf-8');
//             console.log(line);
//             result += line;
//         }
//         console.log("result->", result);
//     } catch (error) {
//         console.error(error);
//     }

// }

export async function start(room, io) {
    const systemPrompt = await prompts.systemPrompt(room.title);
    const messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompts.startPrompt() }
    ];
    room.messages = messages;
    try {
        io.to(room.id).emit('room:message', { from: "主持人", to: "所有人", content: "正在输入...", extra: { done: false, ai: true } });
        const res = await openai.chat.completions.create({
            model: "qwen-turbo",
            messages
        });
        console.log("ai response->", JSON.stringify(res));
        io.to(room.id).emit('room:message', { from: "主持人", to: "所有人", content: res.choices[0].message.content, extra: { done: true, ai: true } });
    } catch (error) {
        console.error(error);
    }
}
