import React from "react";
import "./UserList.css";

export default function UserList({ users, currentUserId }) {
  const entries = Object.entries(users);

  return (
    <div className="user-list">
      <h3>Utilizadores Conectados ({entries.length})</h3>
      {entries.length === 0 && <p className="no-users">Nenhum utilizador conectado</p>}
      <ul>
        {entries.map(([id, { lat, lng }]) => (
          <li key={id} className={id === currentUserId ? "current-user" : ""}>
            <span className="user-label">
              {id === currentUserId ? "Eu" : `Utilizador ${id.slice(0, 6)}`}
            </span>
            <span className="user-coords">
              {lat.toFixed(5)}, {lng.toFixed(5)}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
