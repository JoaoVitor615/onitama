import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "./LoginPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirm, setConfirm] = useState("");

  const handleRegister = async () => {
    const n = nome.trim();
    const e = email.trim();
    const s = senha;
    const c = confirm;
    if (!n || !e || !s || !c) { alert("Preencha todos os campos."); return; }
    if (s !== c) { alert("As senhas não coincidem."); return; }
    alert("Cadastro realizado! Faça login.");
    navigate("/");
  };

  return (
    <>
      <div className="login-container" style={{ backgroundImage: `url(/assets/background-login.gif)` }}>
        <img src="/assets/onitama-logo-principal.png" alt="Logo Onitama" className="logo-img" />
        <div className="login-content register-content">
          <div className="login-box">
            <h1 className="login-title">Cadastro</h1>
            <input type="text" placeholder="Nome" className="login-input" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input type="email" placeholder="Email" className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Senha" className="login-input" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <input type="password" placeholder="Confirmar senha" className="login-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <button className="play-btn" onClick={handleRegister}>Cadastrar</button>
            <div className="login-links">
              <Link to="/">Já tenho conta</Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

export default RegisterPage;