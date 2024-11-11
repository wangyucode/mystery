import { useState, useEffect } from "react";
import {
  Image,
  Button,
  Input,
  Card,
  CardBody,
  CardFooter,
} from "@nextui-org/react";
import { useNavigate } from "react-router-dom";
import {
  ArrowRightEndOnRectangleIcon,
  SquaresPlusIcon,
} from "@heroicons/react/16/solid";

import socket from "./socket";

export default function Home() {
  const stories = [
    { title: "大明星的最后演出", people: 2, image: "/cover/dmxdzhyc.png" },
    { title: "网红校花的堕落", people: 5, image: "/cover/whxhddl.png" },
  ];

  const [select, setSelect] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [max, setMax] = useState(1);

  const navigate = useNavigate();

  useEffect(() => {
    console.log("useEffect->", select);
    socket.on("room:created", (id) => {
      console.log("room:created->", id);
      navigate(`/room/${id}`, { replace: true });
    });

    socket.on("room:joined", (id) => {
      console.log("room:joined->", id);
      navigate(`/room/${id}`, { replace: true });
    });

    socket.on("room:error", (error) => {
      console.log("room:error->", error);
      setError(error);
      setLoading(false);
    });

    return () => {
      socket.off("room:created");
      socket.off("room:joined");
      socket.off("room:error");
    };
  }, []);

  function create() {
    console.log("create->", select);
    if (!select) {
      setError("⚠️ 请选择剧本");
      return;
    }
    if (select === "网红校花的堕落") {
      setError("⚠️ 剧本未上线，敬请期待！");
      return;
    }
    setLoading(true);
    socket.emit("room:create", { name: select, max });
  }

  function join() {
    const id = Number.parseInt(roomId);
    console.log("join->", id);
    if (!id) {
      setError("⚠️ 请输入房间号");
      return;
    }
    setLoading(true);
    socket.emit("room:join", id);
  }

  function storyClick(e) {
    console.log("storyClick->", e.currentTarget.dataset.title);
    setError("");
    setSelect(e.currentTarget.dataset.title);
    setMax(Number.parseInt(e.currentTarget.dataset.people));
  }

  return (
    <main className="flex-1 flex flex-col px-4 gap-4">
      <div className="grid grid-cols-2 content-start gap-4 justify-start">
        {stories.map((story) => (
          <Card
            key={story.title}
            className={`h-60 ${story.title === select ? "ring-4" : ""}`}
            isPressable
            onClick={storyClick}
            data-title={story.title}
            data-people={story.people}
          >
            <CardBody className="p-0">
              <Image
                width={192}
                height={192}
                src={story.image}
                alt={story.title}
                radius="none"
              ></Image>
            </CardBody>
            <CardFooter className="text-sm flex justify-between">
              <b>{story.title}</b>
              <p>{story.people}人</p>
            </CardFooter>
          </Card>
        ))}
      </div>
      {error && (
        <div
          className={`text-sm rounded-lg bg-amber-200 text-amber-600 border p-2 border-amber-600`}
        >
          {error}
        </div>
      )}
      <Button
        color="primary"
        className="w-full"
        onClick={create}
        isLoading={loading}
        endContent={<SquaresPlusIcon className="size-5" />}
      >
        创建
      </Button>
      <div className="flex gap-2">
        <Input
          placeholder="输入房间号"
          className="flex-1"
          type="number"
          value={roomId}
          onValueChange={setRoomId}
        ></Input>
        <Button
          color="secondary"
          isLoading={loading}
          endContent={<ArrowRightEndOnRectangleIcon className="size-5" />}
          onClick={join}
        >
          加入
        </Button>
      </div>
    </main>
  );
}
