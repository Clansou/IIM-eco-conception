const express = require('express')
const cors = require('cors')
const pokeRoutes = require('./routes/poke')
const authRoutes = require('./routes/auth')
const teamsRoutes = require('./routes/teams')

const app = express()
const PORT = process.env.PORT || 3001

app.use(cors())
app.use(express.json())

// Routes
app.use('/api', pokeRoutes)
app.use('/api/auth', authRoutes)
app.use('/api/teams', teamsRoutes)

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok' })
})

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`)
})
