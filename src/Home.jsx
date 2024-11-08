import { useEffect, useState } from "react";
import { Image, Button, Input, Card, CardBody, CardFooter, Link, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";


export default function Home() {


  const stories = [
    { title: "大明星的最后演出", people: 2, image: "/cover/dmxdzhyc.png" },
    { title: "网红校花的堕落", people: 5, image: "/cover/whxhddl.png" },
  ];

  const [select, setSelect] = useState({});
  const [error, setError] = useState("");

  let socket;

  // useEffect(() => {
  //   fetch('/api/socket'); // 初始化 WebSocket 服务器
  //   socket = io();
  //   socket.on('message', msg => {
  //     console.log(msg);
  //   });
  //   return () => {
  //     socket.disconnect();
  //   };
  // }, []);

  function create() {
    if (!select) {
      setError("⚠️ 请选择剧本");
      return;
    }
    if (select === "网红校花的堕落") {
      setError("⚠️ 剧本未上线，敬请期待！");
      return;
    }

    // socket.emit("message", "create");
  }

  function storyClick(e) {
    console.log("storyClick->", e.currentTarget.dataset.title);
    setError("");
    setSelect(e.currentTarget.dataset.title)
  }

  return (
    <main className="flex-1 flex flex-col px-4 gap-4">
      <div className="grid grid-cols-2 content-start gap-4 justify-start">
        {stories.map(story =>
        (
          <Card
            key={story.title}
            className={`h-60 ${story.title === select ? 'ring-4' : ''}`}
            isPressable
            onClick={storyClick}
            data-title={story.title}>
            <CardBody className="p-0">
              <Image width={192} height={192} src={story.image} alt={story.title} radius="none"></Image>
            </CardBody>
            <CardFooter className="text-sm flex justify-between">
              <b>{story.title}</b>
              <p>{story.people}人</p>
            </CardFooter>
          </Card>
        )
        )}
      </div>
      {error && <div className={`text-sm rounded-lg bg-amber-200 text-amber-600 border p-2 border-amber-600`}>{error}</div>}
      <Button color="primary" className="w-full" onClick={create}>创建</Button>
      <div className="flex gap-2">
        <Input placeholder="输入房间号" className="flex-1"></Input>
        <Button color="secondary">加入</Button>
      </div>
    </main >
  );
}
