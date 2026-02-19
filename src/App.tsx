import { lazy, Suspense } from 'react'
import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Loading from './components/Loading'
import ProtectedRoute from './components/ProtectedRoute'

const Home = lazy(() => import('./pages/Home'))
const Pokedex = lazy(() => import('./pages/Pokedex'))
const PokemonDetail = lazy(() => import('./pages/PokemonDetail'))
const WhosThatPokemon = lazy(() => import('./pages/WhosThatPokemon'))
const Quiz = lazy(() => import('./pages/Quiz'))
const TeamBuilder = lazy(() => import('./pages/TeamBuilder'))
const Login = lazy(() => import('./pages/Login'))
const MesEquipes = lazy(() => import('./pages/MesEquipes'))

function App() {
  return (
    <>
      <a href="#main-content" className="skip-link">Aller au contenu</a>
      <Navbar />
      <main id="main-content" className="main">
        <Suspense fallback={<Loading text="Chargement..." />}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/pokedex" element={<Pokedex />} />
            <Route path="/pokemon/:id" element={<PokemonDetail />} />
            <Route path="/whos-that-pokemon" element={<WhosThatPokemon />} />
            <Route path="/quiz" element={<Quiz />} />
            <Route path="/team-builder" element={<TeamBuilder />} />
            <Route path="/login" element={<Login />} />
            <Route path="/mes-equipes" element={<ProtectedRoute><MesEquipes /></ProtectedRoute>} />
          </Routes>
        </Suspense>
      </main>
    </>
  )
}

export default App
