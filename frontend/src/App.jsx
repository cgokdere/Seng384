import { Link, NavLink, Route, Routes } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";
import PeoplePage from "./pages/PeoplePage.jsx";

export default function App() {
  return (
    <div className="app-shell">
      <header className="topbar">
        <div className="container topbar-inner">
          <Link to="/" className="brand">
            Person Management
          </Link>
          <nav className="nav">
            <NavLink to="/" end className={({ isActive }) => (isActive ? "active" : "")}>
              Register
            </NavLink>
            <NavLink to="/people" className={({ isActive }) => (isActive ? "active" : "")}>
              People
            </NavLink>
          </nav>
        </div>
      </header>

      <main className="container main">
        <Routes>
          <Route path="/" element={<RegisterPage />} />
          <Route path="/people" element={<PeoplePage />} />
          <Route path="*" element={<div className="card">Not found</div>} />
        </Routes>
      </main>
    </div>
  );
}
