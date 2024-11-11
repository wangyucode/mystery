
const MAX_ROOMS = 1000;

const unusedIds = [];

const rooms = {};

for (let i = 1; i <= MAX_ROOMS; i++) {
    unusedIds.push(i);
}

export function create(data, socket, io) {
    if (unusedIds.length === 0) {
        socket.emit('room:error', '房间数已到达上限！');
        return;
    }
    const randomIndex = Math.floor(Math.random() * unusedIds.length);
    const id = unusedIds.splice(randomIndex, 1)[0];
    const room = {
        players: [socket.id],
        name: data.name,
        max: data.max
    };
    rooms[id] = room;
    socket.join(id);
    socket.emit('room:created', id);
    io.to(id).emit('room:update', room);
    const message = {
        from: "system",
        to: "所有人",
        content: `${socket.id.substring(0, 3)} 创建了房间`
    }
    io.to(id).emit('room:message', message);
    console.log("create", socket.rooms);
}

export async function join(id, socket, io) {
    const room = rooms[id];
    if (!room) {
        socket.emit('room:error', '房间不存在');
        return;
    }
    if (room.players.length >= room.max) {
        socket.emit('room:error', '房间已满');
        return;
    }
    socket.join(id);
    room.players.push(socket.id);
    socket.emit('room:joined', id);
    io.to(id).emit('room:update', room);
    const message = {
        from: "system",
        to: "所有人",
        content: `${socket.id.substring(0, 3)} 加入了房间`
    }
    io.to(id).emit('room:message', message);
    console.log("join", socket.rooms);
    if (room.players.length === room.max) {
        const message = {
            from: "system",
            to: "所有人",
            content: "房间已满，游戏开始，请选择角色",
            action: "role"
        }
        io.to(id).emit('room:message', message);
    }
}

export function leave(id, socket, io) {
    const room = rooms[id];
    if (!room) {
        socket.emit('room:error', '房间不存在');
        return false;
    }
    if (room.players.length === 1) {
        delete rooms[id];
        unusedIds.push(id);
        console.log("room deleted->", id);
        return true;
    } else {
        let playerFound = null;

        for (let i = 0; i < room.players.length; i++) {
            if (room.players[i] === socket.id) {
                playerFound = room.players[i]; // 保存找到的玩家ID
                room.players.splice(i, 1); // 从数组中移除该玩家
                break; // 找到后退出循环
            }
        }

        // 检查是否找到了玩家，并发送相应的消息
        if (playerFound) {
            const message = {
                from: "system",
                to: "所有人",
                content: `${playerFound.substring(0, 3)}离开了房间`
            };
            io.to(id).emit('room:update', room); // 发送更新后的房间信息
            io.to(id).emit('room:message', message); // 发送玩家离开的消息
        } else {
            // 可选：如果没有找到玩家，可以发送一个不同的消息或者进行其他处理
            console.log('未找到对应的玩家ID:', socket.id);
        }
    }
}