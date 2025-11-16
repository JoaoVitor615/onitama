import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { carregarUsuarioPorHash } from "../api/usuarios";
import "./MenuPage.css";

function Menu() {
  const navigate = useNavigate();
  const [moedas, setMoedas] = useState(0);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setIsOpen(true), 300);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    const hash = localStorage.getItem("usuario_hash");
    if (!hash) return;
    carregarUsuarioPorHash(hash)
      .then((usuario) => {
        const valor = typeof usuario?.moedas === "number" ? usuario.moedas : Number(usuario?.moedas || 0);
        setMoedas(valor);
      })
      .catch(() => {});
  }, []);

  return (
    <div
      className="menu-container"
      style={{ backgroundImage: `url(/assets/background-login.gif)` }}
    >
      <button
        onClick={() => navigate('/')}
        aria-label="Voltar"
        style={{
          position: 'fixed', top: 16, left: 16, zIndex: 3001,
          background: 'none', border: 'none', padding: 0, cursor: 'pointer',
          outline: 'none', boxShadow: 'none', appearance: 'none', WebkitAppearance: 'none', MozAppearance: 'none',
          backgroundColor: 'transparent'
        }}
      >
        <img src={'/icons/seta.png'} alt="Voltar" style={{ width: 40, height: 40, border: 'none', display: 'block' }} />
      </button>
      <div className={`scroll ${isOpen ? "open" : ""}`}>
        <h2 className="menu-title">MENU</h2>
        <div className="menu-buttons">
          <button className="menu-btn" onClick={() => navigate("/salas")}>SALAS</button>
          <button className="menu-btn" onClick={() => navigate("/loja")}>LOJA</button>
          <button className="menu-btn" onClick={() => navigate("/itens")}>SKINS</button>
          <button className="menu-btn" onClick={() => alert("Em breve")}>COMO JOGAR</button>
        </div>
      </div>

      <div style={{ position: 'absolute', top: 16, right: 16, zIndex: 2, display: 'flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.85)', color: '#000', padding: '8px 12px', borderRadius: 12 }}>
        <span style={{ fontWeight: 900 }}>🪙 {moedas}</span>
      </div>
    </div>
  );
}

export default Menu;