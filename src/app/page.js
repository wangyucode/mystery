"use client";

import { Card, CardBody, CardFooter, Divider, Link } from "@nextui-org/react";
import Image from "next/image";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen gap-8 items-center pt-4 text-center">
      <header>
        <h1 className="text-2xl m-2">AI剧本杀</h1>
        <p className="text-sm">在线人类：{100}，在线AI：{500}</p>
      </header>
      <main className="flex-1 grid grid-cols-2 content-start gap-4 justify-start">
        <Card className="h-60 w-48" isPressable>
          <CardBody className="p-0">
            <Image width={192} height={192} src="/cover/dmxdzhyc.png" alt="大明星的最后演出"></Image>
          </CardBody>
          <CardFooter className="text-sm flex justify-between">
            <b>大明星的最后演出</b>
            <p>2人</p>
          </CardFooter>
        </Card>
        <Card className="h-60 w-48" isPressable>
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
        <Link href="https://wycode.cn" size="sm">wycode.cn</Link>
        <Divider orientation="vertical" className="h-6" />
        <Link href='https://github.com/wangyucode/dogger' size="sm"><Image width={16}
              height={16} src="/github.svg" alt="github"></Image></Link>
      </footer>
    </div>
  );
}
