import OpenAI from "openai";
import * as prompts from "./prompts.js";

import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const model = "qwen-turbo";


export async function start(room, io) {
    const systemPrompt = await prompts.systemPrompt(room.title);
    let messages = [
        { role: "system", content: systemPrompt },
        { role: "user", content: prompts.startPrompt() }
    ];
    room.messages = [];
    try {
        const loadingMessage = { from: "主持人", to: "所有人", content: "正在输入...", extra: { done: false, ai: true } };
        io.to(room.id).emit('room:message', loadingMessage);
        let res = await openai.chat.completions.create({
            model,
            messages,
            temperature: 0.1
        });
        console.log("ai response->", JSON.stringify(res));
        let content = res.choices[0].message.content;
        room.tokens += res.usage.total_tokens;
        let message = { from: "主持人", to: "所有人", content, extra: { done: true, ai: true } };
        room.messages.push(message);
        io.to(room.id).emit('room:message', message);
        messages.push({ role: "assistant", content });

        for (const player of room.players) {
            io.to(player.id).emit('room:message', loadingMessage);
            messages.push({ role: "user", content: prompts.roundPrompt(room.round, player.role) });
            res = await openai.chat.completions.create({
                model,
                messages,
                temperature: 0.1
            });
            content = res.choices[0].message.content;
            message = { from: "主持人", to: player.role, content, extra: { done: true, ai: true } };
            room.messages.push(message);
            io.to(player.id).emit('room:message', message);
            messages.push({ role: "assistant", content });
        }
    } catch (error) {
        console.error(error);
    }
}
