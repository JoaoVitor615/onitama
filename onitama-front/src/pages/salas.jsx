import { Link } from "react-router-dom";
import styles from "../SaladeJogos.module.css";
import { Button } from "react-dom";

function Salas() {
  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Salas de Jogo</h1>
        <button className={styles.header}> Comprar </button>
      </div>
      <p className={styles.subtitulo}>Escolha uma sala para jogar</p>

      <div className={styles.gridSalas}>
        {/* Sala Iniciante */}
        <div className={styles.cardSala}>
          <div className={styles.cardHeader}>
            <h3 className={styles.nomeSala}>Sala Iniciante</h3>
            <span className={`${styles.dificuldade} ${styles.facil}`}>
              Fácil
            </span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.lotacao}>1/2 jogadores</span>
            <button className={styles.botaoEntrar}>Entrar</button>
          </div>
        </div>

        {/* Torneio Semanal */}
        <div className={styles.cardSala}>
          <div className={styles.cardHeader}>
            <h3 className={styles.nomeSala}>Sala Iniciante</h3>
            <span className={`${styles.dificuldade} ${styles.facil}`}>
              Fácil
            </span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.lotacao}>1/2 jogadores</span>
            <button className={styles.botaoEntrar}>Entrar</button>
          </div>
        </div>

        <div className={styles.cardSala}>
          <div className={styles.cardHeader}>
            <h3 className={styles.nomeSala}>Sala Iniciante</h3>
            <span className={`${styles.dificuldade} ${styles.facil}`}>
              Fácil
            </span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.lotacao}>1/2 jogadores</span>
            <button className={styles.botaoEntrar}>Entrar</button>
          </div>
        </div>

        {/* Partida Rápida */}
        <div className={styles.cardSala}>
          <div className={styles.cardHeader}>
            <h3 className={styles.nomeSala}>Sala Iniciante</h3>
            <span className={`${styles.dificuldade} ${styles.facil}`}>
              Fácil
            </span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.lotacao}>1/2 jogadores</span>
            <button className={styles.botaoEntrar}>Entrar</button>
          </div>
        </div>

        <div className={styles.cardSala}>
          <div className={styles.cardHeader}>
            <h3 className={styles.nomeSala}>Sala Iniciante</h3>
            <span className={`${styles.dificuldade} ${styles.facil}`}>
              Fácil
            </span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.lotacao}>1/2 jogadores</span>
            <button className={styles.botaoEntrar}>Entrar</button>
          </div>
        </div>

        {/* Arena Master */}
        <div className={styles.cardSala}>
          <div className={styles.cardHeader}>
            <h3 className={styles.nomeSala}>Sala Iniciante</h3>
            <span className={`${styles.dificuldade} ${styles.facil}`}>
              Fácil
            </span>
          </div>
          <div className={styles.cardContent}>
            <span className={styles.lotacao}>1/2 jogadores</span>
            <button className={styles.botaoEntrar}>Entrar</button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Salas;
