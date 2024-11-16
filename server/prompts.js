import fs from "fs/promises";

//const startPrompt = `游戏开始，仅回复你的开场白及以下内容：游戏规则，背景故事。`
// const rolePrompt = `我是 李默，告诉我的角色简介`
// const actionPrompt = `当前是第5轮，按照剧本原文，给出 李默 的剧情和 线索选项，线索选项仅展示线索名称，玩家选择后再展示线索内容`
// const nextPrompt = `当前是第1轮，按照剧本中的线索规则，根据玩家消息，理解玩家意图，如果玩家选择了线索，回复线索内容，如果有下一轮，回复以"<next>"结束，如果没有下一轮回复以"<end>"结束。否则，回复玩家消息并复述线索名称，让玩家选择。以下是玩家消息："李默 对 主持人 说 让我想想"`
// const endPrompt = `游戏已结束，结合玩家消息和剧本给出回复，如果玩家做出了有效回答，无论对错，给出结合玩家之前选择的线索帮助玩家分析并揭示剧本中的真相，回复以"<finish>"结束; 如果玩家没有做出有效回答，鼓励玩家继续回答，回复以"<continue>"结束。玩家消息："李默 对 主持人 说 让我想想"`
const stories = {};

export async function systemPrompt(title) {
    if (!stories[title]) {
        stories[title] = await fs.readFile(`server/doc/${title}.txt`, 'utf8');
    }
    return `<角色介绍>
你是剧本杀的主持人，必须严格遵循剧本内容。
不要凭空创造剧本内容。
对剧本未提到的问题，告知“剧本中未提到”。
每轮游戏开始时，向玩家介绍当前轮次的剧情并提供可选行动。
如果玩家的选择在剧本中有对应结果，告知其后果及是否进入下一轮；
玩家的选择一旦做出不可更改，且不能提出破坏规则的要求。
所有轮次结束后，引导玩家分享他们的结论，并根据剧本揭示最终真相。

<开场白模板>
欢迎来到《{剧本名称}》，{自我介绍}， {我的职责和目标}。

<以下是剧本内容>
${stories[title]}`;
}

export function startPrompt() {
    return "开始游戏，请给出回复仅包括：开场白，游戏规则，背景故事。"
}

export function roundPrompt(round, role) {
    return `当前是第${round}轮，按照剧本原文，给出 ${role} 的${round === 1 ? " 角色简介" : ""} 剧情 和 线索选项，线索选项仅展示线索名称，玩家选择后再展示线索内容`
}

export function nextPrompt(round, role, message) {
    return `当前是第${round}轮，按照剧本原文，根据玩家消息，理解玩家意图，如果玩家选择了线索，回复线索内容，如果有第${round + 1}轮，回复以"<next>"结束，如果没有第${round + 1}轮回复以"<end>"结束。否则，回复玩家消息并复述线索名称，让玩家选择。以下是玩家消息："${role} 对 主持人 说 ${message}"`
}

export function endPrompt(role, message) {
    return `游戏已结束，结合玩家消息和剧本给出回复，如果玩家做出了有效回答，无论对错，给出结合玩家之前选择的线索帮助玩家分析并揭示剧本中的真相，回复以"<finish>"结束; 如果玩家没有做出有效回答，鼓励玩家继续回答。玩家消息："${role} 对 主持人 说 ${message}"`
}
