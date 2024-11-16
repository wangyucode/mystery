import * as host from "./host.js";
import * as prompts from "./prompts.js";


const systemPrompt = await prompts.systemPrompt("深夜蝴蝶馆谋杀案");
console.log(systemPrompt);