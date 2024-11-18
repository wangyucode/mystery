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
        room.tokens += res.usage.total_tokens;
    } catch (e) {
        console.error(e);
        const replyMessage = { from: "host", to: message.from, content: "你把AI整懵了，请换个方式回答", time: new Date().getTime(), extra: { done: true, ai: true } };
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


export async function getSummarizeFromAi(room, message, io) {
    const loadingMessage = { from: "host", to: "all", content: "", extra: { done: false, ai: true } };
    io.to(room.id).emit('room:message', loadingMessage);
    const userPrompt = promptsUtil.summarizePrompt(room, message);
    const prompts = [
        { role: "system", content: promptsUtil.systemPrompt },
        { role: "user", content: userPrompt }
    ];
    console.log("ai request->", userPrompt);
    let jsonReply = null;
    try {
        const res = await openai.chat.completions.create({
            model,
            messages: prompts,
        });
        const content = res.choices[0].message.content;
        console.log("ai response->", content);
        jsonReply = JSON.parse(content);
        room.tokens += res.usage.total_tokens;
    } catch (e) {
        console.error(e);
        const replyMessage = { from: "host", to: "all", content: "你把AI整懵了，请换个方式回答", time: new Date().getTime(), extra: { done: true, ai: true } };
        io.to(room.id).emit('room:message', replyMessage);
        return;
    }
    if (jsonReply?.result) {
        io.to(room.id).emit('room:message', { from: "host", to: "all", content: `${jsonReply.result}\n## 真相：\n${jsonReply.truth}`, time: new Date().getTime(), extra: { done: true, ai: true } });
        handlers.end(room, io);
    } else if (jsonReply?.question) {
        io.to(room.id).emit('room:message', { from: "host", to: "all", content: jsonReply.question, time: new Date().getTime(), extra: { done: true, ai: true } });
    }
}

