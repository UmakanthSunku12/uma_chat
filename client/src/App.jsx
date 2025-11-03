import React, { useEffect, useRef, useState } from "react";
import { io } from "socket.io-client";

/**
 * Chat client configured to connect to backend via VITE_BACKEND_URL
 * Default: http://localhost:4000
 */

const BACKEND = import.meta.env.VITE_BACKEND_URL || "http://localhost:4000";

export default function App() {
  const [socket, setSocket] = useState(null);
  const [username, setUsername] = useState(() => `User${Math.floor(Math.random()*9000)+1000}`);
  const [connected, setConnected] = useState(false);
  const [messages, setMessages] = useState([]); // {id,username,text,ts}
  const [input, setInput] = useState("");
  const messagesRef = useRef(null);

  useEffect(() => {
    const s = io(BACKEND, { transports: ["websocket"] });
    setSocket(s);

    s.on("connect", () => {
      setConnected(true);
      s.emit("join", username);
    });
    s.on("disconnect", () => setConnected(false));

    s.on("history", (history) => {
      setMessages(history || []);
      scrollToBottom();
    });

    s.on("message", (msg) => {
      setMessages(prev => [...prev, msg]);
      scrollToBottom();
    });

    s.on("system", text => {
      setMessages(prev => [...prev, { id: `sys-${Date.now()}`, username: "SYSTEM", text, ts: new Date().toISOString() }]);
      scrollToBottom();
    });

    return () => s.disconnect();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (socket && connected) socket.emit("join", username);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [username]);

  function send() {
    const trimmed = input.trim();
    if (!trimmed || !socket) return;
    socket.emit("sendMessage", { text: trimmed });
    setInput("");
  }

  function onKeyDown(e) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  function scrollToBottom() {
    setTimeout(() => {
      if (messagesRef.current) messagesRef.current.scrollTop = messagesRef.current.scrollHeight;
    }, 50);
  }

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-3xl bg-white rounded-2xl shadow-lg overflow-hidden grid grid-cols-1 md:grid-cols-3">
        <aside className="md:col-span-1 p-4 border-r">
          <div className="mb-4">
            <h1 className="text-xl font-semibold">Chat (MongoDB)</h1>
            <p className="text-sm text-slate-500">Persistent messages with MongoDB</p>
          </div>

          <div className="mb-4">
            <label className="block text-xs font-medium text-slate-600">Display name</label>
            <input
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="mt-2 w-full px-3 py-2 border rounded-md text-sm focus:outline-none focus:ring"
            />
          </div>

          <div className="text-xs text-slate-500">
            <div>Connection: <span className={`font-medium ${connected ? 'text-green-600' : 'text-red-500'}`}>{connected ? 'connected' : 'disconnected'}</span></div>
            <div className="mt-2">Messages: <span className="font-medium">{messages.length}</span></div>
          </div>
        </aside>

        <main className="md:col-span-2 flex flex-col">
          <div ref={messagesRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-slate-50">
            {messages.map(m => (
              <div key={m.id} className="max-w-full">
                <div className={`${m.username === username ? 'text-right' : ''}`}>
                  <div className="inline-block text-sm px-3 py-2 rounded-xl shadow-sm bg-white">
                    <div className="text-xs text-slate-400">{m.username} • <span className="text-[10px]">{new Date(m.ts).toLocaleTimeString()}</span></div>
                    <div className="mt-1 text-sm whitespace-pre-wrap">{m.text}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="p-3 border-t flex items-end gap-2 bg-white">
            <textarea
              className="flex-1 px-3 py-2 border rounded-md resize-none focus:outline-none focus:ring"
              rows={2}
              placeholder="Type a message and press Enter..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={onKeyDown}
            />
            <button
              onClick={send}
              className="px-4 py-2 bg-blue-600 text-white rounded-md shadow-sm hover:bg-blue-700"
            >
              Send
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
