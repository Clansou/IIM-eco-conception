const express = require('express')
const { authMiddleware } = require('../middleware/auth')
const db = require('../database')

const router = express.Router()

// All routes require auth
router.use(authMiddleware)

// GET /api/teams
router.get('/', (req, res) => {
  const teams = db.prepare('SELECT * FROM teams WHERE user_id = ? ORDER BY updated_at DESC').all(req.userId)
  res.json({ teams })
})

// POST /api/teams
router.post('/', (req, res) => {
  const { name, pokemon_ids } = req.body

  if (!name || !pokemon_ids) {
    return res.status(400).json({ error: 'Nom et pokemon_ids requis' })
  }
  if (!Array.isArray(pokemon_ids) || pokemon_ids.length === 0 || pokemon_ids.length > 6) {
    return res.status(400).json({ error: 'L\'equipe doit contenir entre 1 et 6 Pokemon' })
  }

  const result = db.prepare(
    'INSERT INTO teams (user_id, name, pokemon_ids) VALUES (?, ?, ?)'
  ).run(req.userId, name, JSON.stringify(pokemon_ids))

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(result.lastInsertRowid)
  res.status(201).json({ team })
})

// GET /api/teams/:id
router.get('/:id', (req, res) => {
  const team = db.prepare('SELECT * FROM teams WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!team) {
    return res.status(404).json({ error: 'Equipe non trouvee' })
  }
  res.json({ team })
})

// PUT /api/teams/:id
router.put('/:id', (req, res) => {
  const { name, pokemon_ids } = req.body

  const existing = db.prepare('SELECT * FROM teams WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!existing) {
    return res.status(404).json({ error: 'Equipe non trouvee' })
  }

  if (pokemon_ids && (!Array.isArray(pokemon_ids) || pokemon_ids.length === 0 || pokemon_ids.length > 6)) {
    return res.status(400).json({ error: 'L\'equipe doit contenir entre 1 et 6 Pokemon' })
  }

  const updatedName = name || existing.name
  const updatedPokemonIds = pokemon_ids ? JSON.stringify(pokemon_ids) : existing.pokemon_ids

  db.prepare(
    'UPDATE teams SET name = ?, pokemon_ids = ?, updated_at = datetime(\'now\') WHERE id = ? AND user_id = ?'
  ).run(updatedName, updatedPokemonIds, req.params.id, req.userId)

  const team = db.prepare('SELECT * FROM teams WHERE id = ?').get(req.params.id)
  res.json({ team })
})

// DELETE /api/teams/:id
router.delete('/:id', (req, res) => {
  const existing = db.prepare('SELECT * FROM teams WHERE id = ? AND user_id = ?').get(req.params.id, req.userId)
  if (!existing) {
    return res.status(404).json({ error: 'Equipe non trouvee' })
  }

  db.prepare('DELETE FROM teams WHERE id = ? AND user_id = ?').run(req.params.id, req.userId)
  res.json({ message: 'Equipe supprimee' })
})

module.exports = router
