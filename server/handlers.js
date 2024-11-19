import { storiesWithOutDetail, getStory, initStoriesRating } from "./stories.js";

import * as host from "./host.js";
import { db } from "./db.js";

const MAX_ROOMS = 1000;

const unusedIds = [];

const rooms = {};

for (let i = 1; i <= MAX_ROOMS; i++) {
    unusedIds.push(i);
}

export function stroyList(socket) {
    socket.emit("story:list", storiesWithOutDetail);
}

export async function create(data, socket, io) {
    if (unusedIds.length === 0) {
        socket.emit('room:error', '房间数已到达上限！');
        return false;
    }
    let remaining = null;
    try {
        remaining = await db.get(data.key);
    } catch (e) {
        console.error("key error->", data.key, e);
    }
    if (!remaining || remaining.count <= 0) {
        socket.emit('room:error', '房卡剩余次数不足！，请联系管理员');
        return false;
    }

    remaining.count--;
    await db.put(data.key, remaining);
    const randomIndex = Math.floor(Math.random() * unusedIds.length);
    const id = unusedIds.splice(randomIndex, 1)[0];
    const story = getStory(data.select);
    const backendRoom = {
        id,
        players: [{ id: socket.id }],
        story,
        round: 0,
        messages: [],
        tokens: 0,
        choices: []
    };
    rooms[id] = backendRoom;
    socket.join(id);
    socket.emit('room:created', id);

    const frontendRoom = {
        id,
        title: story.title,
        people: story.people,
        players: [{ id: socket.id }],
    };
    io.to(id).emit('room:update', frontendRoom);

    const message = {
        from: "host",
        to: "all",
        content: `欢迎来到《${story.title}》，你可以邀请其他玩家使用 ${id} 加入房间， 房卡剩余次数：${remaining.count}`,
        time: new Date().getTime()
    }
    backendRoom.messages.push(message);
    io.to(id).emit('room:message', message);
    const roleMessage = {
        from: "host",
        to: socket.id,
        content: "请选择你的角色",
        time: new Date().getTime(),
        extra: {
            roles: story.roles,
            rules: story.rules,
            background: story.background
        }
    }
    backendRoom.messages.push(roleMessage);
    socket.emit('room:message', roleMessage);
    console.log("game created->", id, story.title, new Date().toLocaleString());
    return true;
}

export async function join(id, socket, io) {
    const room = rooms[id];
    if (!room) {
        socket.emit('room:error', '房间不存在');
        return;
    }
    if (room.players.length >= room.people) {
        socket.emit('room:error', '房间已满');
        return;
    }
    socket.join(id);
    room.players.push({ id: socket.id });
    socket.emit('room:joined', id);

    const frontendRoom = {
        id,
        title: room.story.title,
        people: room.story.people,
        players: room.players
    };
    io.to(id).emit('room:update', frontendRoom);
    const message = {
        from: "host",
        to: "all",
        content: '有人加入了房间',
        time: new Date().getTime()
    }
    io.to(id).emit('room:message', message);

    if (room.messages?.length) {
        for (const message of room.messages) {
            if (message.to === socket.id || message.to === "all") {
                socket.emit('room:message', message);
            }
        }
    }

    const story = room.story;
    const roleMessage = {
        from: "host",
        to: socket.id,
        content: "请选择你的角色",
        time: new Date().getTime(),
        extra: {
            roles: story.roles,
            background: story.background
        }
    }
    socket.emit('room:message', roleMessage);
    room.messages.push(roleMessage);

    console.log("join", socket.rooms);
}

export function leave(id, socket, io) {
    const room = rooms[id];
    if (!room) {
        return false;
    }
    // remove player from room
    room.players = room.players.filter(p => p.id !== socket.id);

    const message = {
        from: "host",
        to: "all",
        content: '有人离开了房间',
        time: new Date().getTime()
    }
    io.to(id).emit('room:message', message);

    const frontendRoom = {
        id,
        title: room.story.title,
        people: room.story.people,
        players: room.players
    };
    io.to(id).emit('room:update', frontendRoom);

    if (room.players.length === 0) {
        delete rooms[id];
        unusedIds.push(id);
        console.log("room deleted->", id);
        return true;
    }
    return false;
}

export function rejoin(data, socket, io) {
    const room = rooms[data.roomId];
    if (!room) {
        socket.emit('room:error', '房间不存在，请退出');
        return;
    }
    io.to(data.socketId).socketsLeave(data.roomId);
    io.to(data.socketId).disconnectSockets(true);

    const player = room.players.find(p => p.id === data.socketId);

    if (!player) {
        socket.emit('room:error', '你不在房间中，请退出');
        return;
    }
    socket.join(data.roomId);
    player.id = socket.id;

    socket.emit('room:rejoined', data.roomId);

    const frontendRoom = {
        id: data.roomId,
        title: room.story.title,
        people: room.story.people,
        players: room.players
    };
    io.to(data.roomId).emit('room:update', frontendRoom);

    const replaceContent = player.role ? `${player.role} 已重连` : `${data.socketId.slice(0, 4)} 已重连为 ${socket.id.slice(0, 4)}`;
    const message = {
        from: "host",
        to: "all",
        content: replaceContent,
        time: new Date().getTime(),
        extra: {
            oldId: data.socketId,
            newId: socket.id
        }
    }
    io.to(data.roomId).emit('room:message', message);

    if (room.messages?.length) {
        for (const message of room.messages) {
            let needEmit = false;
            if (message.from === data.socketId) {
                message.from = socket.id;
                needEmit = true;
            }
            if (message.to === data.socketId) {
                message.to = socket.id;
                needEmit = true;
            }
            if (message.to === "all") {
                needEmit = true;
            }
            if (needEmit) {
                socket.emit('room:message', message);
            }
        }
    }
}

export function role(room, message, role, io) {
    const player = room.players.find(p => p.id === message.from);
    if (!player) {
        console.error("wtf: player not found when selectrole->", message);
        return;
    }
    if (player.role) {
        const errorMessage = {
            from: "host",
            to: message.from,
            content: '你已经选择了角色',
            time: new Date().getTime(),
            extra: { done: true, ai: true }
        }
        io.to(message.from).emit('room:message', errorMessage);
        return;
    }
    const playerSelected = room.players.find(p => p.role === role);
    if (playerSelected) {
        const errorMessage = {
            from: "host",
            to: message.from,
            content: `${role} 已被选择`,
            time: new Date().getTime(),
            extra: { done: true, ai: true }
        }
        io.to(message.from).emit('room:message', errorMessage);
        return;
    }
    player.role = role;
    const frontendRoom = {
        id: room.id,
        title: room.story.title,
        people: room.story.people,
        players: room.players
    };
    io.to(room.id).emit('room:update', frontendRoom);
    const roleMessage = {
        from: "host",
        to: "all",
        content: `${player.id.slice(0, 4)} 选择扮演角色：${role}`,
        time: new Date().getTime(),
        extra: { done: true, ai: true }
    }
    io.to(room.id).emit('room:message', roleMessage);
    if (room.players.every(p => p.role)) {
        const startMessage = {
            from: "host",
            to: "all",
            content: "所有角色已选择完毕，开始第1轮",
            time: new Date().getTime()
        }
        io.to(room.id).emit('room:message', startMessage);
        nextRound(room, io);
    }
}

export function clue(room, message, key, io) {
    const player = room.players.find(p => p.id === message.from);
    if (!player) {
        console.error("wtf: player not found when select clue->", message);
        const errorMessage = {
            from: "host",
            to: message.from,
            content: '你不在房间中',
            time: new Date().getTime(),
            extra: { done: true, ai: true }
        }
        io.to(message.from).emit('room:message', errorMessage);
        return;
    }
    if (!player.role) {
        console.error("wtf: player not selected role when select clue->", message);
        const errorMessage = {
            from: "host",
            to: message.from,
            content: '你还没有选择角色',
            time: new Date().getTime(),
            extra: { done: true, ai: true }
        }
        io.to(message.from).emit('room:message', errorMessage);
        return;
    }
    const story = room.story.rounds[room.round - 1][player.role];
    if (!story.clues[key]) {
        console.error("wtf: clue not found when select clue->", message);
        const errorMessage = {
            from: "host",
            to: message.from,
            content: '线索不存在',
            time: new Date().getTime(),
            extra: { done: true, ai: true }
        }
        io.to(message.from).emit('room:message', errorMessage);
        return;
    }
    const clue = story.clues[key];
    const content = `# 线索：${clue.title}\n${clue.content}`;
    const clueMessage = {
        from: "host",
        to: message.from,
        content,
        time: new Date().getTime(),
        extra: { done: true, ai: true }
    }

    io.to(message.from).emit('room:message', clueMessage);
    room.messages.push(clueMessage);
    room.choices.push({ role: player.role, key, round: room.round });

    nextRound(room, io);
}

function nextRound(room, io) {
    room.round++;
    if (room.round > room.story.rounds.length) {
        const endMessage = {
            from: "host",
            to: "all",
            content: "所有轮次已结束，请说出你认为的真相",
            time: new Date().getTime()
        }
        io.to(room.id).emit('room:message', endMessage);
        return;
    }
    for (const player of room.players) {
        const story = room.story.rounds[room.round - 1][player.role];
        let clues = "";
        for (const key in story.clues) {
            clues += `- ${key}: ${story.clues[key].title}\n`;
        }
        const content = `# 第${room.round}轮\n## ${player.role}的剧情:\n${story.story}\n## 线索选项：\n${clues}\n请选择你要查看的线索`;
        const message = {
            from: "host",
            to: player.id,
            content,
            time: new Date().getTime()
        }
        io.to(player.id).emit('room:message', message);
        room.messages.push(message);
    }
}

export async function end(room, io) {
    room.round = -1;
    console.log("game end->", room.id, room.story.title, room.tokens, new Date().toLocaleString());
    const endMessage = {
        from: "host",
        to: "all",
        content: "游戏结束",
        time: new Date().getTime(),
        extra: { comment: true }
    }
    io.to(room.id).emit('room:message', endMessage);
    room.messages.push(endMessage);

    const storyRating = await db.get(room.story.title);
    storyRating.tokens += room.tokens;
    storyRating.count += 1;
    await db.put(room.story.title, storyRating);
}

export function message(data, socket, io) {
    console.log("message", data);
    const room = rooms[data.roomId];
    if (!room) {
        return;
    }
    const message = {
        from: socket.id,
        to: data.at,
        content: data.content,
        time: new Date().getTime()
    }

    if (data.at === "all") {
        io.to(data.roomId).emit('room:message', message);
    } else if (data.at === "host") {
        socket.emit('room:message', message);
        if (room.round === -1) {
            const errorMessage = {
                from: "host",
                to: "all",
                content: '我下班啦',
                time: new Date().getTime()
            }
            io.to(data.roomId).emit('room:message', errorMessage);
            return;
        } else if (room.round > room.story.rounds.length) {
            host.getSummarizeFromAi(room, message, io);
        } else {
            host.getReplyFromAi(room, message, io);
        }
    } else {
        const toPlayer = room.players.find(p => p.role === data.at || p.id === data.at);
        if (toPlayer) {
            io.to(toPlayer.id).emit('room:message', message);
        }
        socket.emit('room:message', message);
    }
    room.messages.push(message);
}

export async function rating(data) {
    const room = rooms[data.roomId];
    if (!room) {
        return;
    }
    // find message with extra.comment = true
    const commentMessage = room.messages.find(m => m.extra?.comment);
    if (commentMessage) {
        commentMessage.extra.submitted = data.rating;
    }
    const storyRating = await db.get(room.story.title);
    storyRating.rating += data.rating;
    storyRating.user += 1;
    await db.put(room.story.title, storyRating);
    initStoriesRating();
}
