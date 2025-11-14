import React from "react";
import { useNavigate } from "react-router-dom";
import "./LoginPage.css";
import backgroundLogin from "../assets/background-login.gif";
import logoonitama from "../assets/onitama-logo-principal.png";

function LoginPage() {
  console.log("✅ LoginPage carregou!");
  const navigate = useNavigate();

  return (
    <div
      className="login-container"
      style={{
        backgroundImage: `url(${backgroundLogin})`,
      }}
    >
      {/* Logo centralizada */}
     

      {/* Conteúdo principal */}
      
      <div className="login-content">
         <img src={logoonitama} alt="Logo Onitama" className="logo-img" />
        <div className="login-box">
          <h1 className="login-title">Login</h1>
          <input type="text" placeholder="Usuário" className="login-input" />
          <input type="password" placeholder="Senha" className="login-input" />

          <button className="play-btn" onClick={() => navigate("/menu")}>
            Play
          </button>

          <div className="login-links">
            <a href="#cadastro" className="login-link">
              Cadastre-se
            </a>{" "}
            |{" "}
          </div>
        </div>
      </div>

      {/* Personagem animado */}
    </div>
  );
}

export default LoginPage;
