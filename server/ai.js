import OpenAI from "openai";
import * as promptsUtil from "./prompts.js";
import * as handlers from "./handlers.js";
import dotenv from "dotenv";

dotenv.config();

const openai = new OpenAI({
    apiKey: process.env.DASHSCOPE_API_KEY,
    baseURL: "https://dashscope.aliyuncs.com/compatible-mode/v1",
});

const model = "qwen-plus";