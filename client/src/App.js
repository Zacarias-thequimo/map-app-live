import React from "react";
import useSocket from "./hooks/useSocket";
import Map from "./components/Map";
import UserList from "./components/UserList";
import "./App.css";

export default function App() {
  const { users, currentUserId, connected } = useSocket();

  return (
    <div className="app">
      <header className="app-header">
        <h1>Map App</h1>
        <span className={`status ${connected ? "online" : "offline"}`}>
          {connected ? "Conectado" : "Desconectado"}
        </span>
      </header>
      <main className="app-body">
        <Map users={users} currentUserId={currentUserId} />
        <UserList users={users} currentUserId={currentUserId} />
      </main>
    </div>
  );
}
