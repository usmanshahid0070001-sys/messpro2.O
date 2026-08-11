import { useState, useEffect } from'react';

const messages = [
"Loading MessPro",
"Almost there",
"Fetching UI",
"Preparing Dashboard"
];

export default function LoadingScreen() {
 const [messageIndex, setMessageIndex] = useState(0);

 useEffect(() => {
 const interval = setInterval(() => {
 setMessageIndex((prev) => (prev + 1) % messages.length);
 }, 2000);
 return () => clearInterval(interval);
 }, []);

 return (
 <div className="flex h-screen items-center justify-center bg-zinc-50 dark:bg-zinc-950">
 <div className="flex items-center gap-2.5 min-w-[200px]">
 <div 
 className="w-6 h-6 rounded-full border-[3px] border-zinc-200 dark:border-zinc-800 border-t-zinc-900 dark:border-t-zinc-50 animate-spin shrink-0"
 style={{ animationTimingFunction:'linear'}} 
 />
 <span className="font-sans font-extrabold tracking-tight text-zinc-900 dark:text-zinc-50 text-base animate-pulse">
 {messages[messageIndex]}<span className="text-blue-500">.</span>
 </span>
 </div>
 </div>
 );
}
