import { Link, useNavigate } from "react-router-dom";
import { useState } from "react";
import { loginUsuario } from "../api/usuarios";
import PurchaseNotification from "../components/ui/PurchaseNotification";
import { notifyPurchase } from "../utils/notifyPurchase";
import "./LoginPage.css";

function Home() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");

  const handleLogin = async () => {
    const user = email.trim();
    const pass = senha;
    if (!user || !pass) {
      alert("Preencha usuário (email) e senha.");
      return;
    }
    try {
      const usuario = await loginUsuario(user, pass);
      if (!usuario?.id_usuario || !usuario?.hash_id) throw new Error("Resposta inválida");
      localStorage.setItem("usuario_id", String(usuario.id_usuario));
      localStorage.setItem("usuario_hash", String(usuario.hash_id));
      navigate("/menu");
    } catch (err) {
      notifyPurchase({ type: "login_error", name: "Credenciais inválidas, tente novamente ou cadastre-se" });
    }
  };

  return (
    <>
      <PurchaseNotification />
      <div
        className="login-container"
        style={{ backgroundImage: `url(/assets/background-login.gif)` }}
      >
      <img src="/assets/onitama-logo-principal.png" alt="Logo Onitama" className="logo-img" />
      <div className="login-content">
        <div className="login-box">
          <h1 className="login-title">Login</h1>
          <input
            type="text"
            placeholder="Usuário"
            className="login-input"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
          <input
            type="password"
            placeholder="Senha"
            className="login-input"
            value={senha}
            onChange={(e) => setSenha(e.target.value)}
          />

          <button className="play-btn" onClick={handleLogin}>Play</button>

          <div className="login-links">
            <Link to="/forgot-password">Esqueci a senha</Link> | <Link to="/register">Cadastre-se</Link>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}

export default Home;
