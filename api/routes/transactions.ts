import { Router } from 'express'
import { getDBConnection } from "../../db"

const router = Router()

// Route to get all transactions
router.get('/transactions', async (_, res) => {
  try {
    const knexDb = await getDBConnection()
    const transactions = await knexDb.select().from('spend_transactions')
    res.json(transactions)
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch transactions' })
  }
})

router.post('/top-suppliers', async (req, res) => {
  const { buyer_name, from_date, to_date, limit } = req.body

  if (!buyer_name || !from_date || !to_date) {
    return res.status(400).json({ error: 'Missing required fields: buyer_name, from_date, to_date' })
  }

  try {
    const knexDb = await getDBConnection()

    const results = await knexDb('spend_transactions')
      .select('supplier_name')
      .sum('amount as total_amount')
      .where('buyer_name', buyer_name)
      .andWhere('transaction_timestamp', '>=', from_date)
      .andWhere('transaction_timestamp', '<=', to_date)
      .groupBy('supplier_name')
      .orderBy('total_amount', 'desc')
      .limit(limit)

    res.json({ top_suppliers: results })
  } catch (error) {
    console.error(error)
    res.status(500).json({ error: 'Failed to fetch top suppliers' })
  }
})

export default router
