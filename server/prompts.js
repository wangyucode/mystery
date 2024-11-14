

export function getStartPrompt(story) {
    return `检索剧本中<${story}>中的内容，严格按照检索结果，给出开场白，游戏规则，背景介绍`
}

export function getRolePrompt(role) {
    return `检索剧本中<${story}>中的内容，严格按照检索结果，给出<${role}>的角色简介`
}

export function getActionPrompt(round, role) {
    return `检索剧本中<${story}>中的内容，严格按照检索结果，当前是第<${round}>轮，给出<${role}>的剧情和需要做出的选择，询问玩家的选择`
}

export function getNextPrompt(round, role, to, message) {
    return `检索剧本中<${story}>中的内容，严格按照检索结果，当前是第<${round}>轮，<${role}>对 <${to}> 说 <${message}>。作为一个主持人你选择是否回应这条消息，以及我们是否应该进入下一轮，以json格式给出。示例：回应<角色名称 | 所有人> 并进入下一轮：{"reply": "<主持人的回应>"，"to": "<角色名称 | 所有人>",  "next": true}; 不回应进入下一轮：{"next": true}`
}
