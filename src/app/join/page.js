"use client";

import { useEffect } from "react";
import io from "socket.io-client";
import { Button, Card, CardBody, CardFooter, Input, Link } from "@nextui-org/react";
import Image from "next/image";

let socket;

export default function Join() {

    useEffect(() => {
        socket = io();

        // 监听来自服务器的消息
        socket.on('message', (msg) => {
            console.log(msg);
        });

        return () => {
            socket.disconnect();
        };
    }, []);

    async function create() {
        socket.emit("message","create");
    }

    return (
        <main className="flex-1 flex flex-col gap-4 items-center">
            <Card className="h-60 w-48" isPressable>
                <CardBody className="p-0">
                    <Image width={192} height={192} src="/cover/dmxdzhyc.png" alt="大明星的最后演出"></Image>
                </CardBody>
                <CardFooter className="text-sm flex justify-between">
                    <b>大明星的最后演出</b>
                    <p>2人</p>
                </CardFooter>
            </Card>
            <Button color="primary" className="w-full" onClick={create}>创建</Button>
            <div className="flex gap-2">
                <Input placeholder="输入房间号" className="flex-1"></Input>
            <Button color="secondary">加入</Button>
            </div>
        </main>
    );
}
