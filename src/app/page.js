"use client";

import { Card, CardBody, CardFooter, Link } from "@nextui-org/react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen gap-4 items-center text-center">
      <header className="mt-4">
        <h1 className="text-2xl m-2">AI剧本杀</h1>
        <p className="text-sm">在线人类：{100}，在线AI：{500}</p>
      </header>
      <main className="flex-1 grid grid-cols-2 content-start gap-4 justify-start px-4">
        <Card className="h-60" isPressable>
          <CardBody className="p-0">
            <Image width={192} height={192} src="/cover/dmxdzhyc.png" alt="大明星的最后演出"></Image>
          </CardBody>
          <CardFooter className="text-sm flex justify-between">
            <b>大明星的最后演出</b>
            <p>2人</p>
          </CardFooter>
        </Card>
        <Card className="h-60" isPressable>
          <CardBody className="p-0">
            <Image width={192} height={192} src="/cover/whxhddl.png" alt="网红校花的堕落"></Image>
          </CardBody>
          <CardFooter className="text-sm flex justify-between">
            <b>网红校花的堕落</b>
            <p>5人</p>
          </CardFooter>
        </Card>
      </main>
      <footer className='border-t p-2 text-center w-full flex items-center justify-center text-sm gap-2'>
        <span>Made with ❤️ by</span>
        <Link href="https://wycode.cn" size="sm" isExternal>wycode.cn</Link>
      </footer>
    </div>
  );
}
