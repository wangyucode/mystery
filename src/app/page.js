"use client";
import { useEffect } from "react";
import { Card, CardBody, CardFooter, Link, Popover, PopoverTrigger, PopoverContent } from "@nextui-org/react";
import Image from "next/image";

export default function Home() {

  useEffect(() => {
    fetch('/api/socket'); // 初始化 WebSocket 服务器
  }, []);

  return (
    <main className="flex-1 grid grid-cols-2 content-start gap-4 justify-start px-4">
      <Link href="/join">
        <Card className="h-60" isPressable>
          <CardBody className="p-0">
            <Image width={192} height={192} src="/cover/dmxdzhyc.png" alt="大明星的最后演出"></Image>
          </CardBody>
          <CardFooter className="text-sm flex justify-between">
            <b>大明星的最后演出</b>
            <p>2人</p>
          </CardFooter>
        </Card>
      </Link>
      <Popover placement="bottom" color="warning">
        <PopoverTrigger>
          <Card className="h-60" isPressable>
            <CardBody className="p-0">
              <Image width={192} height={192} src="/cover/whxhddl.png" alt="网红校花的堕落"></Image>
            </CardBody>
            <CardFooter className="text-sm flex justify-between">
              <b>网红校花的堕落</b>
              <p>5人</p>
            </CardFooter>
          </Card>
        </PopoverTrigger>
        <PopoverContent>
          <p className="text-sm font-bold">正在开发中...</p>
        </PopoverContent>
      </Popover>
    </main>
  );
}
