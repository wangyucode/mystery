
//const startPrompt = `游戏开始，仅回复你的开场白及以下内容：游戏规则，背景故事。`
// const rolePrompt = `我是 李默，告诉我的角色简介`
// const actionPrompt = `当前是第5轮，按照剧本原文，给出 李默 的剧情和 线索选项，线索选项仅展示线索名称，玩家选择后再展示线索内容`
// const nextPrompt = `当前是第1轮，按照剧本中的线索规则，根据玩家消息，理解玩家意图，如果玩家选择了线索，回复线索内容，如果有下一轮，回复以"<next>"结束，如果没有下一轮回复以"<end>"结束。否则，回复玩家消息并复述线索名称，让玩家选择。以下是玩家消息："李默 对 主持人 说 让我想想"`
// const endPrompt = `游戏已结束，结合玩家消息和剧本给出回复，如果玩家做出了有效回答，无论对错，给出结合玩家之前选择的线索帮助玩家分析并揭示剧本中的真相，回复以"<finish>"结束; 如果玩家没有做出有效回答，鼓励玩家继续回答，回复以"<continue>"结束。玩家消息："李默 对 主持人 说 让我想想"`

export const systemPrompt = '你是剧本杀的主持人的助手，可以识别主持人和玩家的意图，\n回答总是为json格式，直接以json的{开头，不要包含其它非json内容';

export function userPrompt(lastHostMessageTo, lastHostMessageContent, message) {
    return `请解析主持人和玩家意图。
    1.如果玩家选择角色，角色必须为主持人提到的角色列表中的选项，回答中包括role字段，示例{"role": "角色名称"}
    2.如果玩家选择线索，线索必须为主持人提到的线索列表中的选项，给出线索的key(是大写英文字母)，示例{"key":"A"}
    3.如果玩家没有给出有效回复，按照主持人的消息请求玩家重新回答，示例{"question": "<提醒>"}
    以下是主持人和玩家的最后对话
    主持人 对 ${lastHostMessageTo} 说 ${lastHostMessageContent}
    玩家 对 主持人 说 ${message}`;
}

export function summarizePrompt(room, message) {
    let choices = "";
    for (let choice of room.choices) {
        choices += `${choice.role} 在第${choice.round}轮选择了线索${choice.key};`;
    }
    return `请根据主持人和玩家的消息，玩家结论的评价。
    游戏规则：${room.story.rules}
    背景故事：${room.story.background}
    剧情：${JSON.stringify(room.story.rounds)}
    玩家选择线索：${choices}
    真相：${room.truth}
    玩家结论：${message.content}
    如果玩家给出了结论，无论玩家的结论对错与否，请你结合玩家的选择和真相，给出评价和详细的真相。示例:{"result": "评价", "truth": "真相"}，如果玩家没有给出结论，鼓励玩家继续分析和回答。示例:{"question": "请继续分析"}
    `;
}
