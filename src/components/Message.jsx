import SystemMessage from "./SystemMessage";
import PlayerMessage from "./PlayerMessage";
import TypingMessage from "./TypingMessage";

export default function Message({ message, room }) {
    if (message.extra?.ai && !message.extra?.done) {
        return <TypingMessage />;
    }
    return message.from === "系统"
        ? <SystemMessage message={message} room={room} />
        : <PlayerMessage message={message} room={room} />;
}
