import { useEffect, useState } from "react";
import { Button, Input, Chip, Image } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightStartOnRectangleIcon, PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { toast, Toaster } from "sonner";

import socket from "./socket";
import Message from "./components/Message";

export default function Home() {

  const navigate = useNavigate();
  const [room, setRoom] = useState({ players: [], people: 0 });
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [at, setAt] = useState("所有人");
  const [aiTyping, setAiTyping] = useState("");

  useEffect(() => {
    socket.on("room:message", handleMessage);
    socket.on("room:update", handleUpdate);
    socket.on("room:error", handleError);
    socket.on("room:rejoined", handleRejoined);
    return () => {
      socket.off("room:message", handleMessage);
      socket.off("room:update", handleUpdate);
      socket.off("room:error", handleError);
      socket.off("room:rejoined", handleRejoined);
    };
  }, []);

  function handleMessage(message) {
    console.log("room:message->", message);
    if (message.extra?.ai && !message.extra?.done) {
      setAiTyping(message.from);
    } else {
      setAiTyping("");
    }
    const lastMessage = messages[messages.length - 1];
    if (lastMessage?.extra?.ai && !lastMessage?.extra?.done) {
      // replace last message
      setMessages(prvMessages => [...prvMessages.slice(0, -1), message]);
    } else {
      setMessages(prvMessages => [...prvMessages, message]);
    }

  }

  function handleRejoined(roomId) {
    console.log("room:rejoined->", roomId);
    localStorage.setItem("game", JSON.stringify({ roomId, socketId: socket.id }));
  }

  function handleUpdate(data) {
    console.log("room:update->", data);
    setRoom({ ...data });
  }

  function handleError(message) {
    console.log("room:error->", message);
    toast.error(message);
  }

  function leave() {
    socket.emit("room:leave", room.id);
    localStorage.removeItem("game");
    navigate("/", { replace: true });
  }


  function onClickAt() {
    // setAt(at === "所有人" ? "所有人" : "所有人");
  }

  function onMessageChange(e) {
    setMessage(e.target.value);
  }

  function sendMessage() {
    if (!message) return;
    if (aiTyping) {
      toast.warning(`${aiTyping} 正在说话，请安静`);
      return;
    }
    socket.emit("room:message", { roomId: room.id, content: message, at });
    setMessage("");
  }

  return (
    <main className="flex flex-col p-4 md:p-8 gap-4 text-center min-h-screen container mx-auto">

      <div className="flex items-center gap-2 justify-center">
        <Image src={`/cover/${room.title}.png`} alt={room.title} width={48} height={48} disableSkeleton />
        <h1 className="text-lg font-bold">{room.title}</h1>

      </div>
      <div className="flex gap-2 justify-between items-center">
        <Chip color="primary">房间号：{room.id}</Chip>
        <Chip color="secondary">人数：{room.players.length}/{room.people}</Chip>
        <div className="flex-1"></div>
        <Toaster position="top-center" richColors />
        <Button
          color="danger"
          endContent={<ArrowRightStartOnRectangleIcon className="size-4" />}
          onClick={leave}
          size="sm"
        >
          退出
        </Button>
      </div>
      <div className="flex flex-1 flex-col gap-4">
        {messages.map((message, index) => (
          <Message key={index} message={message} room={room} />
        ))}
      </div>
      <div className="flex">
        <Button className="rounded-r-none" color="secondary" variant="bordered" onClick={onClickAt}>@{at}</Button>
        <Input placeholder="消息内容" className="flex-1" radius="none" variant="bordered" value={message} onChange={onMessageChange}></Input>
        <Button className="rounded-l-none" color="primary" variant="bordered" endContent={<PaperAirplaneIcon className="size-4" />} onClick={sendMessage}>发送</Button>
      </div>

    </main>
  );
}
