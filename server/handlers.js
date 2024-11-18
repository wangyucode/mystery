import { storiesWithOutDetail, getStory } from "./stories.js";
import * as host from "./host.js";

const MAX_ROOMS = 1000;

const unusedIds = [];

const rooms = {};

for (let i = 1; i <= MAX_ROOMS; i++) {
    unusedIds.push(i);
}

export function stroyList(socket) {
    socket.emit("story:list", storiesWithOutDetail);
}

export function create(title, socket, io) {
    if (unusedIds.length === 0) {
        socket.emit('room:error', '房间数已到达上限！');
        return;
    }
    const randomIndex = Math.floor(Math.random() * unusedIds.length);
    const id = unusedIds.splice(randomIndex, 1)[0];
    const story = getStory(title);
    const backendRoom = {
        id,
        players: [{ id: socket.id }],
        story,
        round: 0,
        messages: [],
        tokens: 0
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
        content: `欢迎来到《${story.title}》，你可以邀请其他玩家使用 ${id} 加入房间`,
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
        socket.emit('room:error', '你不在房间中');
        return;
    }
    if (player.role) {
        socket.emit('room:error', '你已经选择了角色');
        return;
    }
    const playerSelected = room.players.find(p => p.role === role);
    if (playerSelected) {
        socket.emit('room:error', `${role} 已被选择`);
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
        time: new Date().getTime()
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

function nextRound(room, io) {
    room.round++;
    for (const player of room.players) {
        const content = `# 第${room.round}轮\n## ${player.role}的剧情:\n${room.story.rounds[room.round - 1][player.role].story}\n## 线索选项：\n${room.story.rounds[room.round - 1][player.role].clues.map(c => `- ${c.key}: ${c.title}`).join('\n')}\n请选择你的行动`;
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
        host.getReplyFromAi(room, message, io);
    } else {
        const toPlayer = room.players.find(p => p.role === data.at || p.id === data.at);
        if (toPlayer) {
            io.to(toPlayer.id).emit('room:message', message);
        }
        socket.emit('room:message', message);
    }
    room.messages.push(message);
}