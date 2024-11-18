import { useEffect, useState, useRef, useLayoutEffect } from "react";
import { Button, Input, Chip, Image, Popover, PopoverTrigger, PopoverContent, ScrollShadow } from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import { ArrowRightStartOnRectangleIcon, PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { toast, Toaster } from "sonner";

import socket from "./socket";
import Message from "./components/Message";
import { getDisplayName } from "./utils";

export default function Room() {

  const navigate = useNavigate();
  const [room, setRoom] = useState({ players: [], people: 0 });
  const [messages, setMessages] = useState([]);
  const [message, setMessage] = useState("");
  const [at, setAt] = useState("all");
  const [atRole, setAtRole] = useState("所有人");
  const [aiTyping, setAiTyping] = useState("");
  const [isAtListOpen, setIsAtListOpen] = useState(false);
  const messageListRef = useRef(null);

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

  useLayoutEffect(() => {
    if (messageListRef.current) {
      messageListRef.current.scrollTop = messageListRef.current.scrollHeight;
    }
  }, [messages]);

  function handleMessage(message) {
    console.log("room:message->", message);
    if (message.extra?.ai) {
      message.extra.done ? setAiTyping("") : setAiTyping(getDisplayName(message.from));
    }

    let needUpdatePlayerId = false;
    if (message.extra?.oldId) {
      needUpdatePlayerId = true;
    }

    setMessages(prvMessages => {
      if (needUpdatePlayerId) {
        prvMessages.forEach(m => {
          if (m.from === message.extra.oldId) {
            m.from = message.extra.newId;
          }
          if (m.to === message.extra.oldId) {
            m.to = message.extra.newId;
          }
        });
      }

      const lastMessage = prvMessages[prvMessages.length - 1];
      if (lastMessage?.extra?.ai && !lastMessage?.extra?.done) {
        return [...prvMessages.slice(0, -1), message];
      } else {
        return [...prvMessages, message];
      }
    });
  }

  function handleRejoined(roomId) {
    console.log("room:rejoined->", roomId);
    localStorage.setItem("game", JSON.stringify({ roomId, socketId: socket.id }));
    // setMessages([...messages]);
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


  function onClickAtItem(e) {
    setAt(e.target.dataset.at);
    setAtRole(e.target.dataset.role);
    setIsAtListOpen(false);
  }

  function onMessageChange(e) {
    setMessage(e.target.value);
  }

  function sendMessage() {
    if (!message) return;
    if (aiTyping) {
      toast.warning(`${aiTyping} 正在说话，请保持安静`);
      return;
    }
    socket.emit("room:message", { roomId: room.id, content: message, at });
    setMessage("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter") {
      sendMessage();
    }
  }

  return (
    <main className="flex flex-col p-4 md:p-8 gap-2 text-center h-screen container mx-auto">

      <div className="flex items-center gap-2 justify-center">
        <Image src={`/cover/${room.title}.png`} alt={room.title} width={48} height={48} disableSkeleton />
        <h1 className="text-lg font-bold">{room.title}</h1>

      </div>
      <div className="flex gap-2 justify-between items-center border-b pb-2">
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
      <div className="flex-1 overflow-y-auto p-4" ref={messageListRef}>
        <div className="flex flex-col gap-4">
          {messages.map((message, index) => <Message key={index} message={message} room={room} />)}
        </div>
      </div>
      <div className="flex">
        <Popover isOpen={isAtListOpen} onOpenChange={setIsAtListOpen}>
          <PopoverTrigger>
            <Button className="rounded-r-none" color="secondary" variant="bordered">@{atRole}</Button>
          </PopoverTrigger>
          <PopoverContent className="flex flex-col">
            <Button size="sm" className="bg-white hover:bg-gray-200" onClick={onClickAtItem} data-at="all" data-role="所有人">所有人</Button>
            <Button size="sm" className="bg-white hover:bg-gray-200" onClick={onClickAtItem} data-at="host" data-role="主持人">主持人</Button>
            {room.players.filter(player => player.id !== socket.id).map(player => (
              <Button size="sm" className="bg-white hover:bg-gray-200" key={player.id} onClick={onClickAtItem} data-at={player.id} data-role={player.role || player.id.slice(0, 4)}>{player.role || player.id.slice(0, 4)}</Button>
            ))}
          </PopoverContent>
        </Popover>
        <Input placeholder="消息内容" className="flex-1" radius="none" variant="bordered" value={message} onChange={onMessageChange} onKeyDown={onKeyDown}></Input>
        <Button className="rounded-l-none" color="primary" variant="bordered" endContent={<PaperAirplaneIcon className="size-4" />} onClick={sendMessage}>发送</Button>
      </div>

    </main>
  );
}
