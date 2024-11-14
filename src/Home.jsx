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
import { toast, Toaster } from "sonner";

import socket from "./socket";

export default function Home() {
  const [select, setSelect] = useState("");
  const [loading, setLoading] = useState(false);
  const [roomId, setRoomId] = useState("");
  const [stories, setStories] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    socket.on("room:created", (id) => {
      console.log("room:created->", id);
      localStorage.setItem("game", JSON.stringify({ roomId: id, socketId: socket.id }));
      navigate(`/room/${id}`, { replace: true });
    });

    socket.on("room:joined", (id) => {
      console.log("room:joined->", id);
      localStorage.setItem("game", JSON.stringify({ roomId: id, socketId: socket.id }));
      navigate(`/room/${id}`, { replace: true });
    });

    socket.on("room:error", (error) => {
      console.log("room:error->", error);
      toast.error(error);
      setLoading(false);
    });

    socket.on("story:list", (stories) => {
      console.log("story:list->", stories);
      setStories(stories);
    });

    socket.emit("story:list");

    return () => {
      socket.off("room:created");
      socket.off("room:joined");
      socket.off("room:error");
      socket.off("story:list");
    };
  }, []);

  function create() {
    console.log("create->", select);
    if (!select) {
      toast.error("请选择剧本");
      return;
    }
    setLoading(true);
    socket.emit("room:create", select);
  }

  function join() {
    const id = Number.parseInt(roomId);
    console.log("join->", id);
    if (!id) {
      toast.error("请输入房间号");
      return;
    }
    setLoading(true);
    socket.emit("room:join", id);
  }

  function storyClick(e) {
    setSelect(e.currentTarget.dataset.title);
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
                src={`/cover/${story.title}.png`}
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
      <Toaster position="top-center" richColors />
    </main>
  );
}
