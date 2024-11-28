import * as host from '../host.js';

export function roleMessage(type) {
    switch (type) {
        case '狼人杀':
            return '等待其它玩家加入游戏或添加AI';
        default:
            return '请选择你的角色';
    }

}

export function handleHostMessage(room, message, io) {
    if (room.story.type === '狼人杀') {
        if (room.round === 0) {
            const errorMessage = {
                from: "host",
                to: message.from,
                content: '等待其它玩家加入游戏或添加AI',
                time: new Date().getTime()
            }

            io.to(message.from).emit('room:message', errorMessage);
        }
    } else {
        if (room.round === -1) {
            const errorMessage = {
                from: "host",
                to: "all",
                content: '我下班啦',
                time: new Date().getTime()
            }
            io.to(data.roomId).emit('room:message', errorMessage);
        } else if (room.round > room.story.rounds.length) {
            host.getSummarizeFromAi(room, message, io);
        } else {
            host.getReplyFromAi(room, message, io);
        }
    }
}