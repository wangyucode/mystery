export function getDisplayName(to, player, selfId) {
    console.log(to, player, selfId);
    return to === selfId ? "你" : player?.role || player?.id?.slice(0, 4);
}