import stories from "./stories.json" assert { type: "json" };
import * as host from "./host.js";

const MAX_ROOMS = 1000;

const unusedIds = [];

const rooms = {};

for (let i = 1; i <= MAX_ROOMS; i++) {
    unusedIds.push(i);
}

export function stroyList(socket) {
    socket.emit("story:list", stories);
}

export function create(title, socket, io) {
    if (unusedIds.length === 0) {
        socket.emit('room:error', '房间数已到达上限！');
        return;
    }
    const randomIndex = Math.floor(Math.random() * unusedIds.length);
    const id = unusedIds.splice(randomIndex, 1)[0];
    const story = stories.find(s => s.title === title);
    const room = {
        id,
        players: [{ id: socket.id }],
        title: story.title,
        people: story.people
    };
    rooms[id] = room;
    socket.join(id);
    socket.emit('room:created', id);
    io.to(id).emit('room:update', room);
    const message = {
        from: "系统",
        to: "你",
        content: `你可以邀请其他玩家使用 ${id} 加入房间`
    }
    socket.emit('room:message', message);
    const roleMessage = {
        from: "系统",
        to: "你",
        content: "请选择你的角色",
        extra: {
            roles: story.roles,
            background: story.background
        }
    }
    socket.emit('room:message', roleMessage);
    console.log("create", socket.rooms);
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
    io.to(id).emit('room:update', room);
    const message = {
        from: "系统",
        to: "所有人",
        content: '有人加入了房间'
    }
    io.to(id).emit('room:message', message);
    const story = stories.find(s => s.title === room.title);
    const roleMessage = {
        from: "系统",
        to: "你",
        content: "请选择你的角色",
        extra: {
            roles: story.roles,
            background: story.background
        }
    }
    socket.emit('room:message', roleMessage);
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
        from: "系统",
        to: "所有人",
        content: '有人离开了房间'
    }
    io.to(id).emit('room:message', message);
    io.to(id).emit('room:update', room);
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
    if (player) {
        socket.join(data.roomId);
        player.id = socket.id;
        const message = {
            from: "系统",
            to: "你",
            content: '重连成功'
        }
        socket.emit('room:message', message);
        socket.emit('room:rejoined', data.roomId);
        io.to(data.roomId).emit('room:update', room);
        const story = stories.find(s => s.title === room.title);
        if (!player.role) {
            const roleMessage = {
                from: "系统",
                to: "你",
                content: "请选择你的角色",
                extra: {
                    roles: story.roles,
                    background: story.background
                }
            }
            socket.emit('room:message', roleMessage);
        } else {
            const roleMessage = {
                from: "系统",
                to: "你",
                content: `你是 ${player.role}`,
                extra: {
                    roles: story.roles,
                    background: story.background
                }
            }
            socket.emit('room:message', roleMessage);
        }
    } else {
        socket.emit('room:error', '你不在这个房间中，请退出');
    }

}

export function role(data, socket, io) {
    const room = rooms[data.roomId];
    if (!room) {
        socket.emit('room:error', '房间不存在');
        return;
    }
    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
        socket.emit('room:error', '你不在房间中');
        return;
    }
    if (player.role) {
        socket.emit('room:error', '你已经选择了角色');
        return;
    }
    const role = room.players.find(p => p.role === data.role);
    if (role) {
        socket.emit('room:error', `${data.role} 已被选择`);
        return;
    }
    player.role = data.role;
    io.to(data.roomId).emit('room:update', room);
    const message = {
        from: "系统",
        to: "所有人",
        content: `${data.role} 已被选择`
    }
    io.to(data.roomId).emit('room:message', message);
    socket.emit('room:role:success');
    if (room.players.every(p => p.role)) {
        const message = {
            from: "系统",
            to: "所有人",
            content: "所有角色已选择完毕，正在邀请AI主持人加入..."
        }
        io.to(data.roomId).emit('room:message', message);
        host.start(room, io);
    }
    console.log("role", `roomId: ${data.roomId}, socketId: ${socket.id}, role: ${data.role}`);
}

export function message(data, socket, io) {
    console.log("message", data);
    const room = rooms[data.roomId];
    if (!room) {
        return;
    }
    const player = room.players.find(p => p.id === socket.id);
    if (!player) {
        return;
    }
    const message = {
        from: player.role || socket.id.slice(0, 4),
        to: data.at,
        content: data.content
    }
    if (data.at === "所有人") {
        io.to(data.roomId).emit('room:message', message);
    } else {
        // io.to(data.roomId).emit('room:message', message);
    }
}