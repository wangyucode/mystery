import { Card, CardBody, Avatar } from "@nextui-org/react";
import { useEffect } from "react";


import socket from "../socket";
import ExtraRoleContent from "./ExtraRoleContent";
import HostIcon from "/src/assets/host.png";
import { getDisplayName } from "../utils";


export default function SystemMessage({ message, room }) {

    useEffect(() => {
        socket.on("room:role:success", handleRoleSuccess);
        return () => {
            socket.off("room:role:success", handleRoleSuccess);
        };
    }, []);


    function handleRoleSuccess() {
        setIsSelected(true);
    }

    return (
        <Card className="self-start">
            <CardBody className="flex flex-row">
                <Avatar
                    className="w-7 h-7 text-tiny mr-2"
                    src={HostIcon}
                    color="secondary"
                />
                <div className="flex flex-col flex-1">
                    <b className="text-xs">{message.from}（AI）</b>
                    <div className="text-sm">
                        <p className={`whitespace-pre-line ${message.extra ? 'font-bold text-amber-500' : ''}`}><span className="text-sky-500 font-normal">@{getDisplayName(message.to, room.players.find(p => p.id === message.to), socket.id)}：</span>{message.content}</p>
                        {message.extra?.roles && <ExtraRoleContent extra={message.extra} room={room} />}
                    </div>
                </div>
            </CardBody>
        </Card>
    );
}