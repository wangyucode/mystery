export function getDisplayName(player, selfId) {
    if (player?.role) {
        return player.role;
    }
    if (player === "all") {
        return "所有人";
    }
    if (player === "host") {
        return "主持人";
    }
    if (player?.id === selfId) {
        return "你";
    }
    if (player === selfId) {
        return "你";
    }
    return player?.id?.slice(0, 4) || "Unknown";
}