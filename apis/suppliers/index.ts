import express from 'express'
import router from './routes'

const app = express()
const port = 3000

app.use(express.json())
app.use('/api/suppliers', router)

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`)
})
