import express from 'express'
import transactionsRouter from './routes/transactions'

const app = express()
const port = 3000

app.use(express.json())
app.use('/api', transactionsRouter)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
