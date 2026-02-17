import { Routes, Route } from 'react-router-dom'
import Navbar from './components/Navbar'
import Home from './pages/Home'
import Pokedex from './pages/Pokedex'
import PokemonDetail from './pages/PokemonDetail'
import WhosThatPokemon from './pages/WhosThatPokemon'
import Quiz from './pages/Quiz'
import TeamBuilder from './pages/TeamBuilder'

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/pokedex" element={<Pokedex />} />
        <Route path="/pokemon/:id" element={<PokemonDetail />} />
        <Route path="/whos-that-pokemon" element={<WhosThatPokemon />} />
        <Route path="/quiz" element={<Quiz />} />
        <Route path="/team-builder" element={<TeamBuilder />} />
      </Routes>
    </>
  )
}

export default App
