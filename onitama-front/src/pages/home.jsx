import { Link } from "react-router-dom";
import { Button } from "../components/Button";
import styles from "../App.module.css";

function Home() {
  return (
    <div className={styles.container}>
      <img
        src="/background-img.png"
        className={styles.bgImg}
        alt="Background"
      />
      <div className={styles.cardlogin}>
        <img src="/onitama.png" alt="Onitama Logo" />
        <div className={styles.campos}>
          <label>Usuário</label>
          <input type="text" placeholder="Insira seu usuário" />
          <label>Senha</label>
          <input type="password" placeholder="Insira sua senha" />
          <Link to="/salas">
            <Button>Entrar</Button>
          </Link>
          <div className={styles.links}>
            <Link to="/forgot-password" style={{ color: "green" }}>
              Esqueci a senha
            </Link>
            <Link to="/register">Cadastre-se</Link>
          </div>
        </div>
      </div>
    </div>
  );
}

export default Home;
