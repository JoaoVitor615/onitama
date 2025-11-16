import { Routes, Route, Navigate, useLocation } from "react-router-dom";
import { useEffect } from "react";
import { enableHoverSound } from "./utils/hoverSound";
import Home from "./pages/home";
import RegisterPage from "./pages/register";
import Menu from "./pages/menu";
import Loja from "./pages/loja";
import Itens from "./pages/itens";
import Onitama from "./pages/onitama";
import Salas from "./pages/salas";
//import About from "./pages/About";
import "./App.module.css";

function RequireAuth({ children }) {
  const location = useLocation();
  try {
    const uid = localStorage.getItem("usuario_id");
    const hash = localStorage.getItem("usuario_hash");
    const hasAuth = Boolean(uid) && Boolean(hash);
    if (!hasAuth) {
      return <Navigate to="/" replace state={{ from: location }} />;
    }
  } catch (_) {}
  return children;
}

function App() {
  const location = useLocation();

  useEffect(() => {
    // Desabilita som de hover na tela de gameplay (/onitama)
    const onGameplay = (location.pathname || "").startsWith("/onitama");
    let cleanup;
    if (!onGameplay) {
      cleanup = enableHoverSound();
    }
    return () => {
      if (cleanup) cleanup();
    };
  }, [location.pathname]);

  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/menu" element={<RequireAuth><Menu /></RequireAuth>} />
        <Route path="/loja" element={<RequireAuth><Loja /></RequireAuth>} />
        <Route path="/itens" element={<RequireAuth><Itens /></RequireAuth>} />
        <Route path="/onitama" element={<RequireAuth><Onitama /></RequireAuth>} />
        <Route path="/salas" element={<RequireAuth><Salas /></RequireAuth>} />
        {/* Adicione mais rotas conforme necessário */}
        <Route path="/forgot-password" element={<RequireAuth><ForgotPassword /></RequireAuth>} />
        <Route path="/register" element={<RegisterPage />} />
        {/* Garantir que rotas do Godot não sejam interceptadas */}
      </Routes>
    </div>
  );
}

// Componentes temporários - você pode criar arquivos separados depois
function ForgotPassword() {
  return (
    <div>
      <h1>Recuperar Senha</h1>
      <p>Página de recuperação de senha...</p>
    </div>
  );
}

// Mantido componente temporário de ForgotPassword

export default App;
