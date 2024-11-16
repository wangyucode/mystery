import { Card, CardBody, Avatar, Button } from "@nextui-org/react";
import { useState, useEffect } from "react";
import { ServerStackIcon, ArrowsPointingOutIcon } from "@heroicons/react/16/solid";

import socket from "../socket";
import ExtraModal from "./ExtraModal";


export default function SystemMessage({ message, room }) {

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

    return (
        <Card className="self-start">
            <CardBody className="flex flex-row items-center">
                <Avatar
                    className="w-7 h-7 text-tiny mr-2"
                    icon={<ServerStackIcon className="size-4" />}
                    color="secondary"
                />
                <div className="flex flex-col">
                    <b className="text-xs">{message.from}</b>
                    <p className="text-sm">
                        <span className="text-sky-500">@{message.to}：</span>
                        {message.content}
                    </p>
                </div>
                {message.extra && (
                    <Button
                        className="ml-2"
                        color="primary"
                        size="sm"
                        endContent={<ArrowsPointingOutIcon className="size-4" />}
                        onClick={() => setOpenExtra(true)}
                    >
                        详情
                        <ExtraModal
                            open={openExtra}
                            onClose={() => setOpenExtra(false)}
                            extra={message.extra}
                            title={message.content}
                            room={room}
                        />
                    </Button>
                )}
            </CardBody>
        </Card>
    );
}