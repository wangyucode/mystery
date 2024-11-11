import { useEffect, useState } from "react";
import { Button, Input, Chip } from "@nextui-org/react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/16/solid";

import socket from "./socket";

export default function Home() {
    const params = useParams();
    const navigate = useNavigate();
    const [room, setRoom] = useState({ players: [], max: 0 });

    useEffect(() => {
        socket.on("room:message", handleMessage);
        socket.on("room:update", handleUpdate);

        return () => {
            socket.off("room:message", handleMessage);
            socket.off("room:update", handleUpdate);
        };
    }, []);

    function handleMessage(message) {
        console.log("room:message->", message);
    }

    function handleUpdate(data) {
        console.log("room:update->", data);
        setRoom(data);
    }
    function exit() {
        socket.emit("room:leave", params.id);
        navigate("/", { replace: true });
    }
    return (
        <main className="flex flex-col p-8 gap-4 text-center min-h-screen">
            <h1 className="text-lg font-bold">{room.name}</h1>
            <div className="flex gap-4">
                <Chip color="primary">房间号：{params.id}</Chip>
                <Chip color="secondary">人类数量：{room.players.length}</Chip>
                <Chip color="secondary">最大数量：{room.max}</Chip>
                <div className="flex-1"></div>
                <Button
                    color="danger"
                    endContent={<ArrowRightStartOnRectangleIcon className="size-5" />}
                    onClick={exit}
                    size="sm"
                >
                    退出
                </Button>
            </div>
            <div className="flex flex-1"></div>
            <div className="flex gap-2">
                <Input placeholder="发消息、输入@选择技能" className="flex-1"></Input>
                <Button color="primary">发送</Button>
            </div>
        </main>
    );
}