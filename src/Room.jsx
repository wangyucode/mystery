import { useEffect, useState } from "react";
import { Button, Input, Chip, Card, CardHeader, CardBody, Divider, Avatar, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRightStartOnRectangleIcon } from "@heroicons/react/16/solid";

import socket from "./socket";

export default function Home() {
  const params = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState({ players: [], max: 0 });
  const [messages, setMessages] = useState([]);
  const [roleModal, setRoleModal] = useState(false);
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
    setMessages(prvMessages => [...prvMessages, message]);
    if (message.action === "role") {
      setRoleModal(true);
    }
  }

  function handleUpdate(data) {
    console.log("room:update->", data);
    setRoom(data);
  }
  function leave() {
    socket.emit("room:leave", Number.parseInt(params.id));
    navigate("/", { replace: true });
  }
  return (
    <main className="flex flex-col p-8 gap-4 text-center min-h-screen container mx-auto">
      <h1 className="text-lg font-bold">{room.name}</h1>
      <div className="flex gap-4">
        <Chip color="primary">房间号：{params.id}</Chip>
        <Chip color="secondary">人类数量：{room.players.length}</Chip>
        <Chip color="secondary">最大数量：{room.max}</Chip>
        <div className="flex-1"></div>
        <Button
          color="danger"
          endContent={<ArrowRightStartOnRectangleIcon className="size-5" />}
          onClick={leave}
          size="sm"
        >
          退出
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-2">
        {messages.map((message, index) => (
          <Card key={index} className="self-start">
            <CardHeader className="text-sm">
              <Avatar className="w-6 h-6 text-tiny mr-2" name={message.from} isBordered color="secondary" size="sm" />
              <p><b>{message.from}</b> 对 <span className="text-sky-500">@{message.to}</span> 说：</p>
            </CardHeader>
            <Divider />
            <CardBody className="text-sm">
              {message.content}
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="flex gap-2">
        <Input placeholder="发消息、输入@选择技能" className="flex-1"></Input>
        <Button color="primary">发送</Button>
      </div>
      <Modal isOpen={roleModal} isDismissible={false} isKeyboardDismissDisabled={true} hideCloseButton={true}>
        <ModalContent>
          <ModalHeader>请选择角色</ModalHeader>
          <ModalBody>
            <div>
              <Button>人类</Button>
              <Button>AI</Button>
            </div>
          </ModalBody>
        </ModalContent>
      </Modal>
    </main>
  );
}
