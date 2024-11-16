import { useState } from "react";
import { Avatar, Button, Card, CardBody, Divider } from "@nextui-org/react";

import socket from "../socket";

export default function ExtraRoleContent({ extra, room }) {

    const self = room.players.find(p => p.id === socket.id);

    const [role, setRole] = useState(extra.roles.find(r => r.name === self.role) || extra.roles[0]);

    function selectRole(e) {
        setRole(extra.roles.find(r => r.name === e.currentTarget.dataset.name));
    }

    function sendRole() {
        socket.emit("room:role", { roomId: room.id, role: role.name });
    }

    return (
        <div className="flex flex-col gap-2 items-start">
            <p className="text-sm whitespace-pre-line">
                {extra.background}
            </p>
            <div className="flex gap-4">
                {extra.roles.map((r) => (
                    <Card isPressable onClick={selectRole} data-name={r.name} key={r.name} className={`${r.name === role.name ? "ring-4" : ""}`}>
                        <CardBody className="flex flex-col items-center gap-2">
                            <Avatar src={`/avatars/${room.title}/${r.name}.png`} alt={r.name} size="lg" />
                            <b>{r.name}</b>
                        </CardBody>
                    </Card>
                ))}
            </div>
            <p className="text-sm whitespace-pre-line">
                {role.desc}
            </p>
            <Divider />
            <Button color="primary" onClick={sendRole} isDisabled={!!self.role} className="self-end">选择</Button>
        </div>
    );
}