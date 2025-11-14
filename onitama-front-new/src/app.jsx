import { Routes, Route } from "react-router-dom";
import Onitama from "./pages/onitama";
import Salas from "./pages/salas";
import Skins from "./pages/skins";

// ✅ novas páginas:
import LoginPage from "./pages/LoginPage";
import MenuPage from "./pages/MenuPage";

import "./App.module.css";

function App() {
  console.log("✅ App carregou!");

  return (
    <div className="App">
      <Routes>
        {/* Tela inicial (login) */}
        <Route path="/" element={<LoginPage />} />

        {/* Menu principal */}
        <Route path="/menu" element={<MenuPage />} />

        {/* Rotas antigas (mantidas) */}
        <Route path="/onitama" element={<Onitama />} />
        <Route path="/salas" element={<Salas />} />
        <Route path="/skins" element={<Skins />} />
      </Routes>
    </div>
  );
}

export default App;
