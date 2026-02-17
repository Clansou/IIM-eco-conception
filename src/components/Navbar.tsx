import { NavLink } from 'react-router-dom'

function Navbar() {
  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          PokeApp
        </NavLink>
        <ul className="navbar-links">
          <li>
            <NavLink to="/pokedex" className={({ isActive }) => isActive ? 'active' : ''}>
              📖 Pokedex
            </NavLink>
          </li>
          <li>
            <NavLink to="/whos-that-pokemon" className={({ isActive }) => isActive ? 'active' : ''}>
              ❓ Qui est-ce ?
            </NavLink>
          </li>
          <li>
            <NavLink to="/quiz" className={({ isActive }) => isActive ? 'active' : ''}>
              🧠 Quiz
            </NavLink>
          </li>
          <li>
            <NavLink to="/team-builder" className={({ isActive }) => isActive ? 'active' : ''}>
              ⚔️ Team Builder
            </NavLink>
          </li>
        </ul>
      </div>
    </nav>
  )
}

export default Navbar
