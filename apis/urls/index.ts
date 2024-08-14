import express from 'express'
import router from './routes'
import { getDBConnection } from "../../db"

async function main() {
  const knexDb = await getDBConnection()

  async function insertUniqueUrls(urls: string[]) {
    try {
      await knexDb.transaction(async (trx) => {
        for (const url of urls) {
          await trx('urls').insert({ url }).onConflict('url').ignore();
        }
      });
      console.log('URLs inserted successfully');
    } catch (err) {
      console.error('Error inserting URLs:', err);
    } finally {
      await knexDb.destroy();
    }
  }

  const urlsToInsert = [
    "https://www.gov.uk/api/content/government/collections/spending-over-25-000",
    "https://www.gov.uk/api/content/government/collections/dfe-department-and-executive-agency-spend-over-25-000"
  ]

  await insertUniqueUrls(urlsToInsert)

  const app = express()
  const port = 3001

  app.use(express.json())
  app.use('/api/urls', router)

  app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`)
  })
}

main().then(res => res)
