import { useEffect, useState } from "react";
import { Button, Input, Chip, Card, Image, CardFooter, ModalFooter, CardHeader, CardBody, Divider, Avatar, Modal, ModalContent, ModalHeader, ModalBody } from "@nextui-org/react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowRightStartOnRectangleIcon, PlusCircleIcon, PaperAirplaneIcon } from "@heroicons/react/16/solid";
import { toast, Toaster } from "sonner";

import socket from "./socket";

export default function Home() {

  const roles = [
    {
      name: "韩伟文",
      desc: "韩伟文是白手起家的典范，自从4年前资历尚浅的他幸运接下大明星李天船的经纪工作之后，他就一直全身心的投入到工作当中。他没有让李天船失望，李天船这几年来一直保持大红大紫，而他也收获个了自己事业上的成功。他其居正直，做事正派，不像圈内其他经纪人那样，使用各种各样卑鄙的手段来达成目标。\n奋斗至今，32岁“高龄的韩伟文身边还没有女人，但他相信自己命中注定的另一半终会出现。最近他开始对同事沈曼离产生了好感，幷且隐隐觉得自己的“真命天女”就是沈曼离。\n朋友们都觉得韩伟文是一个值得信赖的人。另外，他很有幽默感，擅长与人交际。\n朋友们都叫他“韩哥”。"
    },
    {
      name: "沈曼离",
      desc: "沈曼离已经从学校毕业满两年了。6个月前她应聘成为了大明星李天船的助理。从那以后她就一直都处于忙碌之中老工作上非常努力，把李天船的生活打点的井井有条。虽然工作很拼命，但她在享乐的时候也“绝不手软”。她认为人在努力时要竭尽全力，该享受时要尽情享乐。\n沈曼离一直在等待自己的“真命天子”。她售有过一两段短暂的恋情，但目前仍是单身。最近，她对韩伟文越来越有感觉但这也许是因为他们每天大部的时间都待在一起·毕竟他们工作都是要围着大明星李天船转。\n沈曼离是个善良的女孩儿有时说话会显得过于直接，但绝对没有恶意。朋友们都喜欢她大大咧咧的性格。\n朋友们都叫她“小沈”。"
    }
  ]

  const params = useParams();
  const navigate = useNavigate();
  const [room, setRoom] = useState({ players: [], max: 0 });
  const [messages, setMessages] = useState([]);
  const [roleModal, setRoleModal] = useState(false);
  const [role, setRole] = useState(roles[0]);
  const [message, setMessage] = useState("");
  const [at, setAt] = useState("所有人");

  useEffect(() => {
    socket.on("room:message", handleMessage);
    socket.on("room:update", handleUpdate);
    socket.on("room:error", handleError);
    socket.on("room:role", handleRole);
    socket.on("room:role:success", handleRoleSuccess);
    socket.on("room:rejoined", handleRejoined);
    return () => {
      socket.off("room:message", handleMessage);
      socket.off("room:update", handleUpdate);
      socket.off("room:error", handleError);
      socket.off("room:role", handleRole);
      socket.off("room:role:success", handleRoleSuccess);
      socket.off("room:rejoined", handleRejoined);
    };
  }, []);

  function handleMessage(message) {
    console.log("room:message->", message);
    setMessages(prvMessages => [...prvMessages, message]);
  }

  function handleRejoined(roomId) {
    console.log("room:rejoined->", roomId);
    localStorage.setItem("game", JSON.stringify({ roomId, socketId: socket.id }));
  }

  function handleUpdate(data) {
    console.log("room:update->", data);
    setRoom(data);
  }

  function handleError(message) {
    console.log("room:error->", message);
    toast.error(message);
  }

  function handleRole() {
    setRoleModal(true);
  }

  function handleRoleSuccess() {
    setRoleModal(false);
  }

  function leave() {
    socket.emit("room:leave", Number.parseInt(params.id));
    localStorage.removeItem("game");
    navigate("/", { replace: true });
  }

  function selectRole(e) {
    setRole(roles.find((r) => r.name === e.currentTarget.dataset.name));
  }

  function sendRole() {
    socket.emit("room:role", { roomId: Number.parseInt(params.id), role: role.name });
  }

  function onClickAt() {
    // setAt(at === "所有人" ? "所有人" : "所有人");
  }

  function onMessageChange(e) {
    setMessage(e.target.value);
  }

  function sendMessage() {
    if (!message) return;
    socket.emit("room:message", { roomId: Number.parseInt(params.id), content: message, at });
    setMessage("");
  }

  return (
    <main className="flex flex-col p-4 md:p-8 gap-4 text-center min-h-screen container mx-auto">

      <div className="flex items-center gap-2 justify-center">
        <Image src={`/cover/${room.name}.png`} alt={room.name} width={48} height={48} />
        <h1 className="text-lg font-bold">{room.name}</h1>

      </div>
      <div className="flex gap-2 justify-between items-center">
        <Chip color="primary">房间号：{params.id}</Chip>
        <Chip color="secondary">人数：{room.players.length}/{room.max}</Chip>
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
          <Card key={index} className={`${message.from === role.name ? "self-end" : "self-start"}`}>
            <CardHeader className="text-sm">
              <Avatar className="w-6 h-6 text-tiny mr-2" name={message.from} isBordered={message.from === "system"} color="secondary" src={message.from === "system" ? null : `/avatars/dmxdzhyc/${message.from}.png`} />
              <p><b>{message.from}</b> 对 <span className="text-sky-500">@{message.to}</span> 说：</p>
            </CardHeader>
            <Divider />
            <CardBody className="text-sm">
              {message.content}
            </CardBody>
          </Card>
        ))}
      </div>
      <div className="flex">
        <Button className="rounded-r-none" color="secondary" variant="bordered" onClick={onClickAt}>@{at}</Button>
        <Input placeholder="消息内容" className="flex-1" radius="none" variant="bordered" value={message} onChange={onMessageChange}></Input>
        <Button className="rounded-l-none" color="primary" variant="bordered" endContent={<PaperAirplaneIcon className="size-4" />} onClick={sendMessage}>发送</Button>
      </div>
      <Modal isOpen={roleModal} isDismissible={false} isKeyboardDismissDisabled={true} hideCloseButton={true}>
        <ModalContent>
          <ModalHeader>请选择角色</ModalHeader>
          <ModalBody>
            <p className="text-sm">
              背景简介：红遍亚洲的大明星李天船完成签约，确定出演史诗级巨制电影《隋唐大运河》的男主角。当晚，大明星与他的团队、朋友在费雪酒店举办庆祝酒会，大家都沉浸在欢乐的气氛中，喝酒、聊天、跳舞一夜尽欢。
            </p>
            <div className="flex gap-4">
              {roles.map((r) => (
                <Card isPressable onClick={selectRole} data-name={r.name} key={r.name} className={`${r.name === role.name ? "ring-4" : ""}`}>
                  <CardBody className="p-0">
                    <Image src={`/avatars/dmxdzhyc/${r.name}.png`} alt={r.name} radius="none" />
                  </CardBody>
                  <CardFooter>
                    <b>{r.name}</b>
                  </CardFooter>
                </Card>
              ))}
            </div>
            <p className="text-sm">
              {role.desc}
            </p>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onClick={sendRole}>确定</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

    </main>
  );
}
