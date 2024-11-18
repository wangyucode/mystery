import { Card, CardBody, Avatar } from "@nextui-org/react";
import Markdown from "react-markdown";


import socket from "../socket";
import ExtraRoleContent from "./ExtraRoleContent";
import HostIcon from "/src/assets/host.png";
import { getDisplayName } from "../utils";
import CommentContent from "./CommentContent";

export default function SystemMessage({ message, room }) {

    return (
        <Card className="self-start">
            <CardBody className="flex flex-row">
                <Avatar
                    className="w-7 h-7 text-tiny mr-2"
                    src={HostIcon}
                    color="secondary"
                />
                <div className="flex flex-col flex-1">
                    <p className="text-xs">
                        <b>{getDisplayName(message.from, socket.id)}（AI）</b>
                        <b className="text-sky-500">@{getDisplayName(room.players.find(p => p.id === message.to) || message.to, socket.id)}：</b>
                        <span className="text-gray-500">{new Date(message.time).toLocaleTimeString()}</span>
                    </p>
                    <div className="text-sm">
                        <Markdown className={`message ${message.extra?.roles ? 'font-bold text-amber-500' : ''}`}>{message.content}</Markdown>
                        {message.extra?.roles && <ExtraRoleContent extra={message.extra} room={room} />}
                        {message.extra?.comment && <CommentContent submitted={message.extra.submitted} roomId={room.id} />}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}