import { useState, useEffect } from "react";
import { Card, CardBody, Avatar, Button } from "@nextui-org/react";
import { ArrowsPointingOutIcon, ServerStackIcon } from "@heroicons/react/16/solid";

import ExtraModal from "./ExtraModal";
import socket from "../socket";

export default function Message({ message, room }) {
    const [openExtra, setOpenExtra] = useState(false);
    useEffect(() => {
        socket.on("room:role:success", handleRoleSuccess);
        return () => {
            socket.off("room:role:success", handleRoleSuccess);
        };
    }, []);

    function handleRoleSuccess() {
        setOpenExtra(false);
    }

    function isFromSelf(message) {
        const self = room.players.find(p => p.id === socket.id);
        return message.from === self.role || message.from === socket.id.slice(0, 4);
    }

    return (
        <Card className={`${isFromSelf(message) ? "self-end" : "self-start"}`}>
            <CardBody className="flex flex-row items-center">
                <Avatar className="w-7 h-7 text-tiny mr-2"
                    icon={message.from === "系统" ? <ServerStackIcon className="size-4" /> : null}
                    color={message.from === "系统" ? "secondary" : "default"}
                    src={message.from === "系统" ? null : `/avatars/${room.title}/${message.from}.png`}
                />
                <div className="flex flex-col">
                    <b className="text-xs">{message.from}</b>
                    <p className="text-sm"><span className="text-sky-500">@{message.to}：</span>{message.content}</p>

                </div>
                {message.extra && <Button className="ml-2" color="primary" size="sm" endContent={<ArrowsPointingOutIcon className="size-4" />} onClick={() => setOpenExtra(true)}>
                    详情
                    <ExtraModal open={openExtra} onClose={() => setOpenExtra(false)} extra={message.extra} title={message.content} room={room} />
                </Button>}
            </CardBody>
        </Card>
    );
}
