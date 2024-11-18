
//const startPrompt = `游戏开始，仅回复你的开场白及以下内容：游戏规则，背景故事。`
// const rolePrompt = `我是 李默，告诉我的角色简介`
// const actionPrompt = `当前是第5轮，按照剧本原文，给出 李默 的剧情和 线索选项，线索选项仅展示线索名称，玩家选择后再展示线索内容`
// const nextPrompt = `当前是第1轮，按照剧本中的线索规则，根据玩家消息，理解玩家意图，如果玩家选择了线索，回复线索内容，如果有下一轮，回复以"<next>"结束，如果没有下一轮回复以"<end>"结束。否则，回复玩家消息并复述线索名称，让玩家选择。以下是玩家消息："李默 对 主持人 说 让我想想"`
// const endPrompt = `游戏已结束，结合玩家消息和剧本给出回复，如果玩家做出了有效回答，无论对错，给出结合玩家之前选择的线索帮助玩家分析并揭示剧本中的真相，回复以"<finish>"结束; 如果玩家没有做出有效回答，鼓励玩家继续回答，回复以"<continue>"结束。玩家消息："李默 对 主持人 说 让我想想"`

export const systemPrompt = '你是剧本杀的主持人的助手，可以识别主持人和玩家的意图，将主持人和玩家的意图转换为json格式，且仅包含json内容';

export function userPrompt(lastHostMessageTo, lastHostMessageContent, message) {
    return `请解析支持人和玩家意图，给出json格式回复，
    1.如果玩家选择角色，回答中包括role字段，示例{"role": "角色名称"}
    2.如果玩家选择线索，给出线索key，示例{"key":"线索选项的key"}
    3.如果玩家为给出有效回复，按照主持人的消息请求玩家重新回答{"question": "提醒"}
    以下是主持人和玩家的最后对话
    主持人 对 ${lastHostMessageTo} 说 ${lastHostMessageContent}
    玩家 对 主持人 说 ${message}`;
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
