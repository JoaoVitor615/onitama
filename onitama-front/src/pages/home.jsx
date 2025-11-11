import { Link, useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import styles from "../App.module.css";
import { loginUsuario } from "../api/usuarios";

function Home() {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.querySelector('input[type="text"]')?.value?.trim();
    const senha = form.querySelector('input[type="password"]')?.value || '';
    if (!email || !senha) {
      alert('Preencha usuário (email) e senha.');
      return;
    }
    try {
      const usuario = await loginUsuario(email, senha);
      if (!usuario?.id_usuario || !usuario?.hash_id) throw new Error('Resposta inválida');
      localStorage.setItem('usuario_id', String(usuario.id_usuario));
      localStorage.setItem('usuario_hash', String(usuario.hash_id));
      navigate('/menu');
    } catch (err) {
      alert(err?.message || 'Falha no login');
    }
  };

  return (
    <div className={styles.container}>
      <img
        src="/background-img.png"
        className={styles.bgImg}
        alt="Background"
      />
      <div className={styles.cardlogin}>
        <img src="/onitama.png" alt="Onitama Logo" />
        <form className={styles.campos} onSubmit={handleSubmit}>
          <label>Usuário</label>
          <input type="text" placeholder="Insira seu usuário" />
          <label>Senha</label>
          <input type="password" placeholder="Insira sua senha" />
          {/* O botão mantém a estilização; dentro do form ele submete */}
          <Button />
          <div className={styles.links}>
            <Link to="/forgot-password" style={{ color: "green" }}>
              Esqueci a senha
            </Link>
            <Link to="/register">Cadastre-se</Link>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
