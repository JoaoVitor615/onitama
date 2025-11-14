import React, { useEffect, useState } from "react";
import "./MenuPage.css";
import backgroundLogin from "../assets/background-login.gif";
import { useNavigate } from "react-router-dom";

function MenuPage() {
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const timer = setTimeout(() => setIsOpen(true), 300);
    return () => clearTimeout(timer);
  }, []);
  const navigate = useNavigate();
  return (
    <div
      className="menu-container"
      style={{
        backgroundImage: `url(${backgroundLogin})`,
      }}
    >
      <div className={`scroll ${isOpen ? "open" : ""}`}>
        <h2 className="menu-title">MENU</h2>

        <div className="menu-buttons">
          <button className="menu-btn" onClick={() => navigate("/salas")}>
            SALAS
          </button>
          <button className="menu-btn">LOJA</button>
          <button className="menu-btn" onClick={() => navigate("/skins")}>
            SKINS
          </button>
          <button className="menu-btn">COMO JOGAR</button>
        </div>
      </div>

      <img
        src="/seupersonagem.gif"
        alt="Personagem"
        className="menu-character"
      />
    </div>
  );
}

export default MenuPage;
