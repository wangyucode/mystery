import { useState, useEffect } from "react";
import { Link, Chip } from "@nextui-org/react";
import { Outlet } from "react-router-dom";
import socket from "./socket";

export default function App() {

  const [count, setCount] = useState({ user: 0, ai: 0, room: 0 });

  useEffect(() => {
    console.log("socket->", socket);
    socket.on("count", (count) => {
      console.log("count->", count);
      setCount(count);
    });
    return () => {
      socket.off("count");
    };
  }, []);

  return (
    <div className="flex flex-col min-h-screen gap-4 items-center text-center">
      <header className="mt-4">
        <h1 className="text-2xl m-2">AI剧本杀</h1>
        <div className="flex gap-2 items-center">
          <Chip size="sm" color="primary" variant="flat">在线人数：{count.user}</Chip>
          <Chip size="sm" color="secondary" variant="flat">在线AI：{count.ai}</Chip>
          <Chip size="sm" color="warning" variant="flat">房间数：{count.room}</Chip>
        </div>
      </header>
      <Outlet />
      <footer className='border-t p-2 text-center w-full flex items-center justify-center text-sm gap-2'>
        <span>Made with ❤️ by</span>
        <Link href="https://wycode.cn" size="sm" isExternal>wycode.cn</Link>
      </footer>
    </div>
  );
}
