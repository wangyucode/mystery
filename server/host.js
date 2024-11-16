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
    room.messages = messages;
    try {
        const loadingMessage = { from: "主持人", to: "所有人", content: "正在输入...", extra: { done: false, ai: true } };
        io.to(room.id).emit('room:message', loadingMessage);

        console.log("ai request->", JSON.stringify(messages.at(-1)));
        let res = await openai.chat.completions.create({
            model,
            messages,
            temperature: 0.1
        });
        console.log("ai response->", JSON.stringify(res));
        let content = res.choices[0].message.content;
        room.tokens += res.usage.total_tokens;
        let message = { from: "主持人", to: "所有人", content, extra: { done: true, ai: true } };
        io.to(room.id).emit('room:message', message);
        messages.push({ role: "assistant", content });

        room.round++;
        round(room, io);
    } catch (error) {
        console.error(error);
    }
}


export async function round(room, io) {
    for (const player of room.players) {
        const loadingMessage = { from: "主持人", to: player.role, content: "正在输入...", extra: { done: false, ai: true } };
        io.to(player.id).emit('room:message', loadingMessage);
        room.messages.push({ role: "user", content: prompts.roundPrompt(room.round, player.role) });
        console.log("ai request->", JSON.stringify(room.messages.at(-1)));
        const res = await openai.chat.completions.create({
            model,
            messages: room.messages,
            temperature: 0.1
        });
        const content = res.choices[0].message.content;
        room.tokens += res.usage.total_tokens;
        const message = { from: "主持人", to: player.role, content, extra: { done: true, ai: true } };
        io.to(player.id).emit('room:message', message);
        room.messages.push({ role: "assistant", content });
    }
}

export async function next(room, data, io) {
    room.messages.push({ role: "user", content: prompts.nextPrompt(room.round, data.from, data.content) });
    const player = room.players.find(p => p.role === data.from);
    if (!player) {
        return;
    }
    try {
        const loadingMessage = { from: "主持人", to: data.from, content: "正在输入...", extra: { done: false, ai: true } };
        io.to(player.id).emit('room:message', loadingMessage);
        console.log("ai request->", JSON.stringify(room.messages.at(-1)));
        const res = await openai.chat.completions.create({
            model,
            messages: room.messages,
            temperature: 0.1
        });
        let content = res.choices[0].message.content;
        room.tokens += res.usage.total_tokens;
        const message = { from: "主持人", to: data.from, content, extra: { done: true, ai: true } };
        io.to(player.id).emit('room:message', message);
        room.messages.push({ role: "assistant", content });

        if (content.includes("<next>")) {
            room.round++;
            round(room, io);
        } else if (content.includes("<end>")) {
            room.round = -1;
        }
    } catch (error) {
        console.error(error);
    }
}


export async function end(room, data, io) {
    room.messages.push({ role: "user", content: prompts.endPrompt(data.from, data.content) });
    const player = room.players.find(p => p.role === data.from);
    if (!player) {
        return;
    }
    try {
        const loadingMessage = { from: "主持人", to: data.from, content: "正在输入...", extra: { done: false, ai: true } };
        io.to(player.id).emit('room:message', loadingMessage);
        console.log("ai request->", JSON.stringify(room.messages.at(-1)));
        const res = await openai.chat.completions.create({
            model,
            messages: room.messages,
            temperature: 0.1
        });
        let content = res.choices[0].message.content;
        room.tokens += res.usage.total_tokens;
        const message = { from: "主持人", to: data.from, content, extra: { done: true, ai: true } };
        io.to(player.id).emit('room:message', message);
        room.messages.push({ role: "assistant", content });

        if (content.includes("<finish>")) {
            room.round = -2;
            io.to(room.id).emit('room:message', { from: "系统", to: "所有人", content: "游戏结束，主持人已离开，你可以退出或与其他人继续讨论", extra: { exit: true } });
            console.log("game end->", JSON.stringify({ ...room, messages: null }), new Date().toLocaleString());
        }
    } catch (error) {
        console.error(error);
    }
}


