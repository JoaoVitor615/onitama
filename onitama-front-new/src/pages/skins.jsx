import React, { useState } from "react";
import "./skins.css";
import backgroundLoja from "../assets/backgroundloja.png";
import cachorroMestre from "../assets/skins/cachorro.jpg";
import relamapago from "../assets/skins/relampago.png";
import sombra from "../assets/skins/sombra.png";
function Skins() {
  const [moedas, setMoedas] = useState(10);
  const [abaAtiva, setAbaAtiva] = useState("pecas");

  const skinsPecas = [
    {
      nome: "Skin Cachorro Mestre",
      preco: 1000,
      imagem: cachorroMestre,
    },
    {
      nome: "Skin Cachorro Peao",
      preco: 500,
      imagem: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    },
    {
      nome: "Skin Gato Peao",
      preco: 500,
      imagem: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    },
    {
      nome: "Skin Gato Mestre",
      preco: 1000,
      imagem: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    },
    {
      nome: "Skin Cachorro Mestre",
      preco: 1000,
      imagem: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    },
    {
      nome: "Skin Cachorro Peao",
      preco: 500,
      imagem: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    },
    {
      nome: "Skin Gato Peao",
      preco: 500,
      imagem: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    },
    {
      nome: "Skin Gato Mestre",
      preco: 1000,
      imagem: "https://cdn-icons-png.flaticon.com/512/616/616408.png",
    },
  ];

  const skinsMapa = [
    {
      nome: "Mapa Clássico",
      preco: 0,
      imagem: "https://cdn-icons-png.flaticon.com/512/4322/4322991.png",
    },
    {
      nome: "Mapa Noturno",
      preco: 300,
      imagem: "https://cdn-icons-png.flaticon.com/512/814/814513.png",
    },
    {
      nome: "Mapa Clássico",
      preco: 0,
      imagem: "https://cdn-icons-png.flaticon.com/512/4322/4322991.png",
    },
    {
      nome: "Mapa Noturno",
      preco: 300,
      imagem: "https://cdn-icons-png.flaticon.com/512/814/814513.png",
    },
    {
      nome: "Mapa Clássico",
      preco: 0,
      imagem: "https://cdn-icons-png.flaticon.com/512/4322/4322991.png",
    },
    {
      nome: "Mapa Noturno",
      preco: 300,
      imagem: "https://cdn-icons-png.flaticon.com/512/814/814513.png",
    },
    {
      nome: "Mapa Clássico",
      preco: 0,
      imagem: "https://cdn-icons-png.flaticon.com/512/4322/4322991.png",
    },
    {
      nome: "Mapa Noturno",
      preco: 300,
      imagem: "https://cdn-icons-png.flaticon.com/512/814/814513.png",
    },
  ];

  const skinsPoderes = [
    {
      nome: "Poder Relâmpago",
      preco: 500,
      imagem: relamapago,
    },
    {
      nome: "Poder Sombra",
      preco: 800,
      imagem: sombra,
    },
    {
      nome: "Poder Relâmpago",
      preco: 500,
      imagem: "https://cdn-icons-png.flaticon.com/512/477/477406.png",
    },
    {
      nome: "Poder Sombra",
      preco: 800,
      imagem: "https://cdn-icons-png.flaticon.com/512/1058/1058697.png",
    },
    {
      nome: "Poder Relâmpago",
      preco: 500,
      imagem: "https://cdn-icons-png.flaticon.com/512/477/477406.png",
    },
    {
      nome: "Poder Sombra",
      preco: 800,
      imagem: "https://cdn-icons-png.flaticon.com/512/1058/1058697.png",
    },
    {
      nome: "Poder Relâmpago",
      preco: 500,
      imagem: "https://cdn-icons-png.flaticon.com/512/477/477406.png",
    },
    {
      nome: "Poder Sombra",
      preco: 10,
      imagem: "https://cdn-icons-png.flaticon.com/512/1058/1058697.png",
    },
  ];

  const comprar = (skin) => {
    if (moedas >= skin.preco) {
      setMoedas(moedas - skin.preco);
      alert(`Você comprou: ${skin.nome}`);
    } else {
      alert("Moedas insuficientes!");
    }
  };

  const renderizarSkins = () => {
    switch (abaAtiva) {
      case "pecas":
        return skinsPecas;
      case "mapa":
        return skinsMapa;
      case "poderes":
        return skinsPoderes;
      default:
        return [];
    }
  };

  return (
    <div
      className="loja-fundo"
      style={{ backgroundImage: `url(${backgroundLoja})` }}
    >
      {/* abas fora da moldura */}
      <div className="header-prin">
        <button className="btn-voltar" navigate="/home">
          Voltar
        </button>
        <h1 className="titulo-loja">LOJA</h1>
        <div className="moedas-header">
          <span className="icone-moeda">🪙</span> {moedas}
        </div>
      </div>

      <div className="abas-container">
        <button
          className={`aba ${abaAtiva === "pecas" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("pecas")}
        >
          SKINS DE PEÇAS
        </button>
        <button
          className={`aba ${abaAtiva === "mapa" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("mapa")}
        >
          SKINS DE MAPA
        </button>
        <button
          className={`aba ${abaAtiva === "poderes" ? "ativa" : ""}`}
          onClick={() => setAbaAtiva("poderes")}
        >
          PODERES
        </button>
      </div>

      {/* painel principal */}
      <div className="painel-loja">
        <div className="grid-skins">
          {renderizarSkins().map((skin, i) => (
            <div key={i} className="card-skin">
              {skin.imagem ? (
                <img
                  src={skin.imagem}
                  alt={skin.nome}
                  className="imagem-skin"
                />
              ) : (
                <div className="imagem-vazia">?</div>
              )}
              <h3 className="nome-skin">{skin.nome}</h3>
              <div className="preco-container">
                <span className="icone-moeda">🪙</span>
                <span className="preco">{skin.preco}</span>
                <button onClick={() => comprar(skin)} className="botao-comprar">
                  COMPRAR
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

export default Skins;
