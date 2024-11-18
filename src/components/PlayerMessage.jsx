import { Card, CardBody, Avatar } from "@nextui-org/react";
import Markdown from "react-markdown";
import { QuestionMarkCircleIcon } from "@heroicons/react/16/solid";

import socket from "../socket";
import { getDisplayName } from "../utils";

export default function PlayerMessage({ message, room }) {

    const selfPlayer = room.players.find(p => p.id === socket.id);
    const fromPlayer = room.players.find(p => p.id === message.from);

    return (
        <Card className={`${message.from === socket.id ? "self-end" : "self-start"}`}>
            <CardBody className="flex flex-row">
                <Avatar
                    className="w-8 h-8 mr-2"
                    src={`/avatars/${room.title}/${selfPlayer?.role}.png`}
                    fallback={<QuestionMarkCircleIcon className="w-8 h-8 text-gray-400" />}
                    showFallback
                />
                <div className="flex flex-col flex-1">
                    <p className="text-xs">
                        <b>{getDisplayName(fromPlayer, socket.id)} {message.extra?.ai ? "(AI)" : ""}</b>
                        <b className="text-sky-500">@{getDisplayName(room.players.find(p => p.id === message.to) || message.to, socket.id)}：</b>
                        <span className="text-gray-500">{new Date(message.time).toLocaleTimeString()}</span>
                    </p>
                    <Markdown className="text-sm whitespace-pre-wrap">
                        {message.content}
                    </Markdown>
                </div>
            </CardBody>
        </Card>
    );
}