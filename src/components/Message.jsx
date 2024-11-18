import SystemMessage from "./SystemMessage";
import PlayerMessage from "./PlayerMessage";
import TypingMessage from "./TypingMessage";

import "./message.css";

export default function Message({ message, room }) {
    if (message.extra?.ai && !message.extra?.done) {
        return <TypingMessage from={message.from} />;
    }
    return message.from === "host"
        ? <SystemMessage message={message} room={room} />
        : <PlayerMessage message={message} room={room} />;
}
