import express from 'express'
import router from './routes'

async function main() {
  const app = express()
  const port = 3002

  app.use(express.json())
  app.use('/api/audits', router)

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

main().then(res => res)
