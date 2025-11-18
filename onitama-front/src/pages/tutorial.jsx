import React, { useState } from "react";
import "./TutorialPage.css";

function Tutorial() {
  const [slide, setSlide] = useState(0);

  const instrucoes = [
    {
      titulo: "O Objetivo do Jogo",
      texto: `
      No Onitama, dois mestres e seus alunos duelam em um tabuleiro 5x5.
      Seu objetivo é derrotar o Mestre inimigo OU chegar com seu Mestre
      no templo adversário.
      `,
      img: "/assets/tutorialtab.png",
    },
    {
      titulo: "As Cartas de Movimento",
      texto: `
      O jogo usa 5 cartas por partida. Cada carta mostra
      movimentos possíveis para uma peça.
      Você e seu oponente compartilham essas cartas.
      `,
      img: "/assets/tutorial1.png",
    },
    {
      titulo: "Como se Mover",
      texto: `
      Em seu turno, escolha uma carta para mover um aluno ou o mestre.
      Depois de usar a carta, ela vai para o adversário, criando 
      um ciclo estratégico de movimentos!
      `,
      img: "/assets/tutorial2.png",
    },
    {
      titulo: "Condições de Vitória",
      texto: `
      Você vence de duas maneiras:
      1) Capturar o Mestre inimigo (Vitória do Dragão).
      2) Levar seu Mestre até o templo adversário (Vitória da Montanha).
      `,
      img: "/assets/tutorial3.png",
    },
  ];

  const next = () => {
    if (slide < instrucoes.length - 1) setSlide(slide + 1);
  };

  const prev = () => {
    if (slide > 0) setSlide(slide - 1);
  };

  return (
    <div className="how-container">
      <img src="/assets/comojogar.png" className="how-bg" alt="Background" />

      <div className="scroll-box">
        <h1 className="how-title">COMO JOGAR</h1>

        <div className="carousel">
          <h2 className="carousel-title">{instrucoes[slide].titulo}</h2>
          <p className="carousel-text">{instrucoes[slide].texto}</p>

          {instrucoes[slide].img && (
            <img
              src={instrucoes[slide].img}
              className="carousel-img"
              alt="Ilustração do tutorial"
            />
          )}

          <div className="carousel-buttons">
            <button
              className="carousel-btn"
              onClick={prev}
              disabled={slide === 0}
            >
              ◀ Anterior
            </button>

            <span className="slide-indicator">
              {slide + 1} / {instrucoes.length}
            </span>

            <button
              className="carousel-btn"
              onClick={next}
              disabled={slide === instrucoes.length - 1}
            >
              Próximo ▶
            </button>
          </div>
        </div>

        <button className="back-btn" onClick={() => window.history.back()}>
          Voltar
        </button>
      </div>
    </div>
  );
}

export default Tutorial;