import { Routes, Route } from "react-router-dom";
import Home from "./pages/Home";
import Onitama from "./pages/onitama";
import Salas from "./pages/salas";
//import About from "./pages/About";
import "./App.module.css";

function App() {
  return (
    <div className="App">
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/onitama" element={<Onitama />} />
        <Route path="/salas" element={<Salas />} />
        {/* Adicione mais rotas conforme necessário */}
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/register" element={<Register />} />
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

function Register() {
  return (
    <div>
      <h1>Cadastro</h1>
      <p>Página de cadastro...</p>
    </div>
  );
}

export default App;
