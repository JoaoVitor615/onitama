import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "../App.module.css";
import { carregarUsuarioPorHash } from "../api/usuarios";

function Menu() {
  const navigate = useNavigate();
  const [moedas, setMoedas] = useState(0);

  useEffect(() => {
    const hash = localStorage.getItem('usuario_hash');
    if (!hash) return;
    carregarUsuarioPorHash(hash)
      .then((usuario) => {
        const valor = typeof usuario?.moedas === 'number' ? usuario.moedas : Number(usuario?.moedas || 0);
        setMoedas(valor);
      })
      .catch(() => {});
  }, []);

  const panelStyle = {
    width: "500px",
    maxWidth: "90vw",
    minHeight: "520px",
    borderRadius: "18px",
    padding: "28px 24px",
    background: "rgba(255,245,220,0.92)",
    boxShadow:
      "rgba(0, 0, 0, 0.25) 0px 14px 28px, rgba(0, 0, 0, 0.22) 0px 10px 10px",
    border: "6px solid #8b5a2b",
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "18px",
    zIndex: 999,
  };

  const titleStyle = {
    fontSize: "40px",
    fontWeight: 900,
    color: "#5a3f2c",
    margin: 0,
  };

  const listStyle = {
    display: "flex",
    flexDirection: "column",
    gap: "14px",
    width: "100%",
    maxWidth: "320px",
  };

  const btnStyle = {
    width: "100%",
    padding: "12px 18px",
    borderRadius: "12px",
    border: "none",
    background: "#8b0000",
    color: "#fff",
    fontWeight: 900,
    fontSize: "18px",
    cursor: "pointer",
  };

  const disabledBtnStyle = {
    ...btnStyle,
    background: "#5c0a0a",
    cursor: "not-allowed",
    opacity: 0.85,
  };

  return (
    <div className={styles.container}>
      <img src="/background-img.png" className={styles.bgImg} alt="Background" />
      {/* Barra de moedas no topo direito */}
      <div style={{
        position: 'absolute', top: 16, right: 16, zIndex: 1000,
        display: 'flex', alignItems: 'center', gap: 8,
        background: 'rgba(0,0,0,0.4)', color: '#fff',
        padding: '8px 10px', borderRadius: 10,
      }}>
        <img src="/icons/coin.png" alt="Moedas" style={{ width: 28, height: 28 }} />
        <span style={{ fontWeight: 800, fontSize: 18 }}>{moedas}</span>
      </div>
      <div style={panelStyle}>
        <h1 style={titleStyle}>MENU</h1>
        <div style={listStyle}>
          <button style={btnStyle} onClick={() => navigate("/salas")}>SALAS</button>
          <button style={disabledBtnStyle} onClick={() => alert("Em breve")}>LOJA</button>
          <button style={disabledBtnStyle} onClick={() => alert("Em breve")}>SKINS</button>
          <button style={disabledBtnStyle} onClick={() => alert("Em breve")}>COMO JOGAR</button>
        </div>
      </div>
    </div>
  );
}

export default Menu;