import { Link } from "@nextui-org/react";

export default function App({ children }) {

  return (
    <div className="flex flex-col min-h-screen gap-4 items-center text-center">
      <header className="mt-4">
        <h1 className="text-2xl m-2">AI剧本杀</h1>
        <p className="text-sm">在线人类：{100}，在线AI：{500}</p>
      </header>
      {children}
      <footer className='border-t p-2 text-center w-full flex items-center justify-center text-sm gap-2'>
        <span>Made with ❤️ by</span>
        <Link href="https://wycode.cn" size="sm" isExternal>wycode.cn</Link>
      </footer>
    </div>
  );
}
