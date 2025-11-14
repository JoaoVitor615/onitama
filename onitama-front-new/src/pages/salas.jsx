import { useNavigate } from "react-router-dom";
import styles from "../SaladeJogos.module.css";
import { useEffect, useState, useCallback } from "react";
import { criarSala, listarSalas, entrarSala } from "../api/salas";
import { subscribeLista } from "../api/ws";

function Salas() {
  const navigate = useNavigate();
  const [salas, setSalas] = useState([]);
  const [presencas, setPresencas] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // popup
  const [mostrarPopup, setMostrarPopup] = useState(false);
  const [novoNome, setNovoNome] = useState("");
  const [novaSenha, setNovaSenha] = useState("");

  const carregar = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await listarSalas();
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

    const unsubscribe = subscribeLista(
      (p) => {
        if (p?.codigo) {
          setPresencas((prev) => {
            const next = { ...prev, [p.codigo]: p.presentes ?? 0 };
            setSalas((curr) =>
              curr.map((s) =>
                s.codigo === p.codigo ? { ...s, presentes: next[p.codigo] } : s
              )
            );
            return next;
          });
        }
      },
      (u) => {
        if (u?.codigo) {
          setSalas((curr) => {
            const idx = curr.findIndex((s) => s.codigo === u.codigo);
            if (idx >= 0) {
              const next = [...curr];
              next[idx] = {
                ...next[idx],
                status: u.status,
                presentes: u.presentes ?? next[idx].presentes,
              };
              return next;
            }
            return [
              {
                codigo: u.codigo,
                status: u.status,
                presentes: u.presentes ?? 0,
                capacidade: 2,
                SalaJogador: [],
              },
              ...curr,
            ];
          });
        }
      },
      (d) => {
        if (d?.codigo) {
          setSalas((curr) => curr.filter((s) => s.codigo !== d.codigo));
          setPresencas((prev) => {
            const { [d.codigo]: _, ...rest } = prev;
            return rest;
          });
        }
      }
    );
    return () => unsubscribe && unsubscribe();
  }, [carregar]);

  const handleCriarSala = async () => {
    try {
      const s = await criarSala({ nome: novoNome, senha: novaSenha });
      await carregar();
      const codigo = s?.codigo || s?.data?.codigo;
      if (codigo) {
        navigate(`/onitama?codigo=${encodeURIComponent(codigo)}`);
      }
    } catch (e) {
      alert("Não foi possível criar a sala.");
    }
  };

  const handleEntrarSala = async (codigo) => {
    try {
      await entrarSala({ codigo });
      await carregar();
      navigate(`/onitama?codigo=${encodeURIComponent(codigo)}`);
    } catch (e) {
      alert("Não foi possível entrar na sala.");
    }
  };

  return (
    <div className={styles.container}>
      {/* HEADER */}
      <div className={styles.header}>
        <div className={styles.leftHeader}>
          <button
            className={styles.botaoVoltar}
            onClick={() => navigate("/home")}
          >
            ←
          </button>
          <button
            className={styles.botaoVoltar}
            onClick={() => navigate("/about")}
          >
            Como jogar?
          </button>
        </div>

        <h1 className={styles.tituloPrincipal}>SALAS</h1>

        <div className={styles.rightHeader}>
          <button
            className={styles.botaoSkins}
            onClick={() => navigate("/skins")}
          >
            SKINS
          </button>
          <button className={styles.botaoCompras}>💰 COMPRAS</button>
        </div>
      </div>

      {/* CONTEÚDO CENTRAL */}
      <div className={styles.conteudo}>
        <p className={styles.subtitulo}>Escolha uma sala para jogar</p>

        <div className={styles.gridSalas}>
          {salas.length === 0 && !loading && (
            <div className={styles.cardSala}>
              <div className={styles.cardHeader}>
                <h3 className={styles.nomeSala}>Nenhuma sala disponível</h3>
                <span className={`${styles.dificuldade} ${styles.facil}`}>
                  Fácil
                </span>
              </div>
              <div className={styles.cardContent}>
                <span className={styles.lotacao}>0/2 jogadores</span>
                <button
                  className={styles.botaoEntrar}
                  onClick={() => setMostrarPopup(true)}
                >
                  Criar
                </button>
              </div>
            </div>
          )}

          {salas.map((sala, idx) => {
            const nome =
              sala?.nome ||
              sala?.host?.apelido ||
              `Sala ${sala?.codigo || idx + 1}`;
            const jogadores = presencas[sala?.codigo] ?? sala?.presentes ?? 0;
            const capacidade = sala?.capacidade ?? 2;
            const codigo = sala?.codigo;
            return (
              <div className={styles.cardSala} key={codigo || idx}>
                <div className={styles.cardHeader}>
                  <h3 className={styles.nomeSala}>{nome}</h3>
                  <span className={`${styles.dificuldade} ${styles.facil}`}>
                    Fácil
                  </span>
                </div>
                <div className={styles.cardContent}>
                  <span className={styles.lotacao}>
                    {jogadores}/{capacidade} jogadores
                  </span>
                  <button
                    className={styles.botaoEntrar}
                    onClick={() => handleEntrarSala(codigo)}
                  >
                    Entrar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ===== POPUP ===== */}
      {mostrarPopup && (
        <div className={styles.popupOverlay}>
          <div className={styles.popup}>
            <h2 className={styles.popupTitulo}>Criar Sala</h2>

            <label className={styles.popupLabel}>Nome da Sala:</label>
            <input
              type="text"
              className={styles.popupInput}
              value={novoNome}
              onChange={(e) => setNovoNome(e.target.value)}
              placeholder="Ex: Sala dos Ninjas"
            />

            <label className={styles.popupLabel}>Senha (opcional):</label>
            <input
              type="password"
              className={styles.popupInput}
              value={novaSenha}
              onChange={(e) => setNovaSenha(e.target.value)}
              placeholder="Digite uma senha"
            />

            <div className={styles.popupBotoes}>
              <button
                className={styles.popupCancelar}
                onClick={() => setMostrarPopup(false)}
              >
                Cancelar
              </button>
              <button
                className={styles.popupCriar}
                onClick={() => {
                  handleCriarSala();
                  setMostrarPopup(false);
                }}
              >
                Criar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Salas;
