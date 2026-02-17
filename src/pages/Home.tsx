import { Link } from 'react-router-dom'

function Home() {
  return (
    <div className="page">
      <div className="home-hero">
        <h1>PokeApp</h1>
        <p>
          Explorez le monde des Pokemon ! Parcourez le Pokedex, testez vos connaissances
          avec nos mini-jeux et construisez l'equipe ultime.
        </p>
      </div>

      <div className="home-features">
        <Link to="/pokedex" className="feature-card">
          <div className="feature-card-icon">📖</div>
          <h3>Pokedex</h3>
          <p>Parcourez les 151 Pokemon de la premiere generation. Recherchez, filtrez par type et decouvrez leurs stats.</p>
        </Link>

        <Link to="/whos-that-pokemon" className="feature-card">
          <div className="feature-card-icon">❓</div>
          <h3>Qui est ce Pokemon ?</h3>
          <p>Le jeu classique ! Devinez le Pokemon a partir de sa silhouette. Combien pouvez-vous en trouver ?</p>
        </Link>

        <Link to="/quiz" className="feature-card">
          <div className="feature-card-icon">🧠</div>
          <h3>Quiz des Types</h3>
          <p>Testez vos connaissances sur les faiblesses de type. Quel type est super efficace contre ce Pokemon ?</p>
        </Link>

        <Link to="/team-builder" className="feature-card">
          <div className="feature-card-icon">⚔️</div>
          <h3>Team Builder</h3>
          <p>Construisez votre equipe de reve de 6 Pokemon. Analysez la couverture de types et les stats moyennes.</p>
        </Link>
      </div>
    </div>
  )
}

export default Home
