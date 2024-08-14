import { Router } from 'express'
import { getDBConnection } from "../../db"

const router = Router()

// Route to get all transactions

type SupplierStatsRequest = {
  supplier_name: string;
}

type SupplierStatsResponse = {
  unique_buyers: number;
  transaction_count: number;
  total_transaction_value: number;
}

type SpendStatsResponse = {
  unique_buyers: number;
  transaction_count: number;
  unique_suppliers: number;
}

router.get("/", (_req, res) => {
  // route documentation here
  res.send(`
    <h1>API Routes</h1>
    <p>GET <a href="/api/stats">/api/stats</a> - This operation exposes basic high level stats of the transaction database.</p>
    <p>POST /api/supplier_stats - This operation returns stats for a specific supplier.</p>
    <p>POST /api/top_suppliers - This operation returns the top suppliers by transaction value.</p>
  `)
})

/**
 * This operation exposes basic high level stats of the transaction database.
 */
router.get("/stats", async (_req, res) => {
  const knexDb = await getDBConnection()

  const result = await knexDb("spend_transactions").select(
    knexDb.raw("COUNT(*) AS transaction_count"),
    knexDb.raw("COUNT(DISTINCT supplier_name) as unique_suppliers"),
    knexDb.raw("COUNT(DISTINCT buyer_name) as unique_buyers")
  )

  const response: SpendStatsResponse = {
    unique_buyers: result[0].unique_buyers,
    unique_suppliers: result[0].unique_suppliers,
    transaction_count: result[0].transaction_count,
  }

  res.json(response)
})



/**
 * This operation returns stats for a specific supplier.
 */
router.post("/supplier_stats", async (req, res, next) => {
  try {
    const knexDb = await getDBConnection()
    const requestPayload = req.body as SupplierStatsRequest
    if (!requestPayload.supplier_name) {
      throw new Error("`supplier_name` must be specified.")
    }

    const result = await knexDb("spend_transactions")
      .where({ supplier_name: requestPayload.supplier_name })
      .select(
        knexDb.raw("COUNT(*) AS transaction_count"),
        knexDb.raw("SUM(amount) as total_value"),
        knexDb.raw("COUNT(DISTINCT buyer_name) as unique_buyers")
      )

    console.log(JSON.stringify(result))
    const response: SupplierStatsResponse = {
      unique_buyers: result[0].unique_buyers,
      total_transaction_value: result[0].total_value,
      transaction_count: result[0].transaction_count,
    }

    res.json(response)
  } catch (err) {
    next(err)
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
  } catch (err) {
    console.error(err)
    res.status(500).json({ error: 'Failed to fetch top suppliers' })
  }
})

export default router
