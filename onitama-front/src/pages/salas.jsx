import { Link } from "react-router-dom";
import styles from "../SaladeJogos.module.css";
import { useEffect, useState, useCallback } from "react";
import { criarSala, listarSalas, entrarSala } from "../api/salas";

function Salas() {
  const [salas, setSalas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listarSalas();
      // Espera que a API retorne { success, data: [] }
      const lista = res?.data || res || [];
      setSalas(Array.isArray(lista) ? lista : []);
    } catch (e) {
      setError("Falha ao carregar salas");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    carregar();
    const id = setInterval(carregar, 5000);
    return () => clearInterval(id);
  }, [carregar]);

  const handleCriarSala = async () => {
    try {
      await criarSala();
      await carregar();
    } catch (e) {
      alert("Não foi possível criar a sala.");
    }
  };

  const handleEntrarSala = async (codigo) => {
    try {
      await entrarSala({ codigo });
      await carregar();
    } catch (e) {
      alert("Não foi possível entrar na sala.");
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.titulo}>Salas de Jogo</h1>
        <button className={styles.header} onClick={handleCriarSala}> Criar </button>
      </div>
      <p className={styles.subtitulo}>Escolha uma sala para jogar</p>

      <div className={styles.gridSalas}>
        {salas.length === 0 && !loading && (
          <div className={styles.cardSala}>
            <div className={styles.cardHeader}>
              <h3 className={styles.nomeSala}>Nenhuma sala disponível</h3>
              <span className={`${styles.dificuldade} ${styles.facil}`}>Fácil</span>
            </div>
            <div className={styles.cardContent}>
              <span className={styles.lotacao}>0/2 jogadores</span>
              <button className={styles.botaoEntrar} onClick={handleCriarSala}>Criar</button>
            </div>
          </div>
        )}

        {salas.map((sala, idx) => {
          const nome = sala?.nome || sala?.host?.apelido || `Sala ${sala?.codigo || idx + 1}`;
          const jogadores = sala?.jogadores?.length ?? sala?.lotacaoAtual ?? 1;
          const capacidade = sala?.capacidade ?? 2;
          const codigo = sala?.codigo;
          return (
            <div className={styles.cardSala} key={codigo || idx}>
              <div className={styles.cardHeader}>
                <h3 className={styles.nomeSala}>{nome}</h3>
                <span className={`${styles.dificuldade} ${styles.facil}`}>Fácil</span>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.lotacao}>{jogadores}/{capacidade} jogadores</span>
                <button className={styles.botaoEntrar} onClick={() => handleEntrarSala(codigo)}>Entrar</button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

export default Salas;
