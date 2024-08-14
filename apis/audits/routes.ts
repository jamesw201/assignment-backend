import { Router } from 'express'
import { getDBConnection } from "../../db"

const router = Router()

router.post('/deadletters', async (req, res) => {
  const { from_date, to_date, limit } = req.body

  if (!from_date || !to_date) {
    return res.status(400).json({ error: 'Missing required fields: from_date, to_date' })
  }

  try {
    const knexDb = await getDBConnection()

    const results = await knexDb('transaction_dead_letter')
      .select()
      .andWhere('pipeline_timestamp', '>=', from_date)
      .andWhere('pipeline_timestamp', '<=', to_date)
      .limit(limit)

    res.json({ deadletters: results })
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch deadletters' })
  }
})

export default router
