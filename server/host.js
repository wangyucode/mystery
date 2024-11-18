import OpenAI from "openai";
import * as promptsUtil from "./prompts.js";
import * as handlers from "./handlers.js";

import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const model = "qwen-turbo";

export async function getReplyFromAi(room, message, io) {
    const loadingMessage = { from: "host", to: message.from, content: "", extra: { done: false, ai: true } };
    io.to(message.from).emit('room:message', loadingMessage);
    let lastHostMessageContent = ""
    let lastHostMessageTo = ""
    // find the last message from host to message.from or to all
    for (let i = room.messages.length - 1; i >= 0; i--) {
        const msg = room.messages[i];
        if (msg.from === "host" && (msg.to === message.from || msg.to === "all")) {
            lastHostMessageContent = msg.content;
            lastHostMessageTo = msg.to === "all" ? "所有人" : room.players.find(p => p.id === msg.to)?.role || msg.to.slice(0, 4);
            if (msg?.extra?.roles?.length) {
                lastHostMessageContent += `\n角色列表：\n${msg.extra.roles.map(r => `- ${r.name}: ${r.desc}`).join('\n')}`;
            }
            break;
        }
    }

    const userPrompt = promptsUtil.userPrompt(lastHostMessageTo, lastHostMessageContent, message.content);
    const prompts = [
        { role: "system", content: promptsUtil.systemPrompt },
        { role: "user", content: userPrompt }
    ];

    console.log("ai request->", userPrompt);
    let jsonReply = null;
    try {
        // await new Promise(resolve => setTimeout(resolve, 10000));
        // throw new Error("test");
        const res = await openai.chat.completions.create({
            model,
            messages: prompts,
        });
        const content = res.choices[0].message.content;
        console.log("ai response->", content);
        jsonReply = JSON.parse(content);
    } catch (e) {
        console.error(e);
        const replyMessage = { from: "host", to: message.from, content: "AI 似乎抽风了，请稍后再试", time: new Date().getTime(), extra: { done: true, ai: true } };
        io.to(message.from).emit('room:message', replyMessage);
        return;
    }
    if (jsonReply?.question) {
        const replyMessage = { from: "host", to: message.from, content: jsonReply.question, time: new Date().getTime(), extra: { done: true, ai: true } };
        io.to(message.from).emit('room:message', replyMessage);
    } else if (jsonReply?.role) {
        handlers.role(room, message, jsonReply.role, io);
    } else if (jsonReply?.key) {
        handlers.clue(room, message, jsonReply.key, io);
    } else {
        console.error("wtf: invalid json reply->", jsonReply);
    }
}


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


