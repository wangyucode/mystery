
const MAX_ROOMS = 1000;

let unusedIds = [];

for (let i = 0; i < MAX_ROOMS; i++) {
    unusedIds.push(i);
}

export function create(name, socket){
    if(unusedIds.length === 0){
        socket.emit('room:error', 'No more rooms available');
        return;
    }
    const randomIndex = Math.floor(Math.random() * unusedIds.length);
    let randomId = unusedIds.splice(randomIndex, 1)[0];
    let roomId = `${name}-${randomId}`;
    socket.join(roomId);
    socket.emit('room:created', roomId);
    console.log("create", socket.rooms);
}