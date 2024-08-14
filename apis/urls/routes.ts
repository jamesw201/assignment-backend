import { Router } from 'express'
import { getDBConnection } from "../../db"

const router = Router()

router.get("/", (_req, res) => {
  // route documentation here
  res.send(`
    <h1>API Routes</h1>
    <p>GET <a href="/api/urls/unvisited">/api/urls/unvisited</a> - This operation exposes a list of URLS to the application.</p>
  `)
})

// Route to get all transactions
router.get('/unvisited', async (_, res) => {
  try {
    const knexDb = await getDBConnection()
    const transactions = await knexDb.select().from('urls')
    res.json(transactions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

export default router
