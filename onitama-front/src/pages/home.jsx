import { useNavigate } from "react-router-dom";
import { Button } from "../components/Button";
import styles from "../App.module.css";
import { loginUsuario } from "../api/usuarios";
import PurchaseNotification from "../components/ui/PurchaseNotification";

function Home() {
  const navigate = useNavigate();
  const handleSubmit = async (e) => {
    e.preventDefault();
    const form = e.currentTarget;
    const email = form.querySelector('input[type="text"]')?.value?.trim();
    const senha = form.querySelector('input[type="password"]')?.value || '';
    if (!email || !senha) {
      try {
        const { notifyPurchase } = await import('../utils/notifyPurchase');
        notifyPurchase({ type: 'login_invalido', name: 'Preencha usuário e senha.' });
      } catch (_) {}
      return;
    }
    try {
      const usuario = await loginUsuario(email, senha);
      if (!usuario?.id_usuario || !usuario?.hash_id) throw new Error('Resposta inválida');
      localStorage.setItem('usuario_id', String(usuario.id_usuario));
      localStorage.setItem('usuario_hash', String(usuario.hash_id));
      navigate('/menu');
    } catch (err) {
      try {
        const { notifyPurchase } = await import('../utils/notifyPurchase');
        notifyPurchase({ type: 'login_invalido', name: err?.message || 'Usuário ou senha inválidos.' });
      } catch (_) {}
    }
  };

  return (
    <div className={styles.container}>
      <img
        src="/background-img.png"
        className={styles.bgImg}
        alt="Background"
      />
      <PurchaseNotification />
      <div className={styles.cardlogin}>
        <img src="/onitama.png" alt="Onitama Logo" />
        <form className={styles.campos} onSubmit={handleSubmit}>
          <label>Usuário</label>
          <input type="text" placeholder="Insira seu usuário" />
          <label>Senha</label>
          <input type="password" placeholder="Insira sua senha" />
          {/* Botão de envio do formulário */}
          <Button />
          <div className={styles.links}>
            <button type="button" onClick={() => navigate('/forgot-password')} style={{ background: 'transparent', border: 'none', color: 'green', cursor: 'pointer' }}>
              Esqueci a senha
            </button>
            <button type="button" onClick={() => navigate('/register')} style={{ background: 'transparent', border: 'none', color: '#000', cursor: 'pointer' }}>
              Cadastre-se
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Home;
