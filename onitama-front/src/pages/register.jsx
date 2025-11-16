import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { cadastrarUsuario } from "../api/usuarios";
import PurchaseNotification from "../components/ui/PurchaseNotification";
import { notifyPurchase } from "../utils/notifyPurchase";
import "./LoginPage.css";

function RegisterPage() {
  const navigate = useNavigate();
  const [nome, setNome] = useState("");
  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [confirm, setConfirm] = useState("");
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    const n = nome.trim();
    const e = email.trim();
    const s = senha;
    const c = confirm;
    if (!n || !e || !s || !c) { notifyPurchase({ type: 'register_error', name: 'Preencha todos os campos.' }); return; }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(e)) { notifyPurchase({ type: 'register_error', name: 'E-mail inválido.' }); return; }
    if (s.length < 4) { notifyPurchase({ type: 'register_error', name: 'A senha deve ter pelo menos 4 caracteres.' }); return; }
    if (s !== c) { notifyPurchase({ type: 'register_error', name: 'As senhas não coincidem.' }); return; }
    try {
      setLoading(true);
      const novo = await cadastrarUsuario(n, e, s);
      // Sucesso: redireciona ao login e mostra notificação
      navigate("/");
      setTimeout(() => {
        notifyPurchase({ type: 'user_created', name: `Usuário ${n} criado` });
      }, 60);
    } catch (err) {
      notifyPurchase({ type: 'register_error', name: err?.message || 'Falha ao cadastrar. Tente novamente.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <PurchaseNotification />
      <div className="login-container" style={{ backgroundImage: `url(/assets/background-login.gif)` }}>
        <img src="/assets/onitama-logo-principal.png" alt="Logo Onitama" className="logo-img" />
        <div className="login-content register-content">
          <div className="login-box">
            <h1 className="login-title">Cadastro</h1>
            <input type="text" placeholder="Nome" className="login-input" value={nome} onChange={(e) => setNome(e.target.value)} />
            <input type="email" placeholder="Email" className="login-input" value={email} onChange={(e) => setEmail(e.target.value)} />
            <input type="password" placeholder="Senha" className="login-input" value={senha} onChange={(e) => setSenha(e.target.value)} />
            <input type="password" placeholder="Confirmar senha" className="login-input" value={confirm} onChange={(e) => setConfirm(e.target.value)} />
            <button className="play-btn" onClick={handleRegister} disabled={loading}>{loading ? 'Aguarde...' : 'Cadastrar'}</button>
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