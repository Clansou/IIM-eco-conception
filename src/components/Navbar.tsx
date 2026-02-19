import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'

function Navbar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/')
  }

  return (
    <nav className="navbar" aria-label="Navigation principale">
      <div className="navbar-inner">
        <NavLink to="/" className="navbar-logo">
          PokeApp
        </NavLink>
        <ul className="navbar-links">
          <li>
            <NavLink to="/pokedex" className={({ isActive }) => isActive ? 'active' : ''}>
              Pokedex
            </NavLink>
          </li>
          <li>
            <NavLink to="/whos-that-pokemon" className={({ isActive }) => isActive ? 'active' : ''}>
              Qui est-ce ?
            </NavLink>
          </li>
          <li>
            <NavLink to="/quiz" className={({ isActive }) => isActive ? 'active' : ''}>
              Quiz
            </NavLink>
          </li>
          <li>
            <NavLink to="/team-builder" className={({ isActive }) => isActive ? 'active' : ''}>
              Team Builder
            </NavLink>
          </li>
          {user && (
            <li>
              <NavLink to="/mes-equipes" className={({ isActive }) => isActive ? 'active' : ''}>
                Mes Equipes
              </NavLink>
            </li>
          )}
        </ul>
        <div className="navbar-auth">
          {user ? (
            <>
              <span className="navbar-user">{user.email}</span>
              <button className="navbar-logout" onClick={handleLogout} type="button">
                Deconnexion
              </button>
            </>
          ) : (
            <NavLink to="/login" className="navbar-login">
              Connexion
            </NavLink>
          )}
        </div>
      </div>
    </nav>
  )
}

export default Navbar
