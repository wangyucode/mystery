import { Card, CardBody, Avatar } from "@nextui-org/react";
import { useState, useEffect } from "react";

import hostIcon from "/src/assets/host.png";

export default function TypingMessage({ from }) {
    const [dots, setDots] = useState(".");

    useEffect(() => {
        const interval = setInterval(() => {
            setDots(prev => prev.length >= 6 ? "." : prev + ".");
        }, 300);

        return () => clearInterval(interval);
    }, []);

    return (
        <Card className="self-start">
            <CardBody className="flex flex-row items-center">
                <Avatar
                    className="w-7 h-7 text-tiny mr-2"
                    src={hostIcon}
                />
                <div className="flex flex-col">
                    <b className="text-xs">主持人</b>
                    <p className="text-sm">
                        <span>正在输入{dots}</span>
                    </p>
                </div>
            </CardBody>
        </Card>
    );
}