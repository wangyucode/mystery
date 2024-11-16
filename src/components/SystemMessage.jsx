import { Card, CardBody, Avatar } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { ServerStackIcon } from "@heroicons/react/16/solid";

import socket from "../socket";
import ExtraRoleContent from "./ExtraRoleContent";


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
                    icon={<ServerStackIcon className="size-4" />}
                    color="secondary"
                />
                <div className="flex flex-col flex-1">
                    <b className="text-xs">{message.from}</b>
                    <p className="text-sm">
                        <span className="text-sky-500">@{message.to}：</span>
                        {message.content}
                        {message.extra?.roles && <ExtraRoleContent extra={message.extra} room={room} />}
                    </p>
                </div>
            </CardBody>
        </Card>
    );
}