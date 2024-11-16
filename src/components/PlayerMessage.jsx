import { Card, CardBody, Avatar } from "@nextui-org/react";
import Markdown from "react-markdown";

import socket from "../socket";
import hostIcon from "/src/assets/host.png";

export default function PlayerMessage({ message, room }) {

    function isFromSelf(message) {
        const self = room.players.find(p => p.id === socket.id);
        return message.from === self.role || message.from === socket.id.slice(0, 4);
    }

    return (
        <Card className={`${isFromSelf(message) ? "self-end" : "self-start"}`}>
            <CardBody className="flex flex-row">
                <Avatar
                    className="w-8 h-8 mr-2"
                    src={message.from === "主持人" ? hostIcon : `/avatars/${room.title}/${message.from}.png`}
                />
                <div className="flex flex-col flex-1">
                    <b className="text-xs">{message.from} {message.extra?.ai ? "(AI)" : ""} <span className="text-sky-500">@{message.to}：</span></b>
                    <Markdown className="text-sm whitespace-pre-wrap">
                        {message.content}
                    </Markdown>
                </div>
            </CardBody>
        </Card>
    );
}