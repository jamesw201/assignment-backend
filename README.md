# Stotles Backend Enginer work sample assignment

## Problem statement

All the instructions are available [here](https://www.notion.so/stotles/Backend-engineer-work-sample-assignment-15b1dd4d10d3430a8735cd3b2f12ade7).

### Summary of requirements

See the instructions (linked above) for warm-up task and full problem statement.

The core requirements are:

1. Fix the failing test so that we can correctly parse transaction amounts.
2. `fetch-transaction-data` should load all files published since 2020 from the following links:
   1. https://www.gov.uk/government/collections/spending-over-25-000
   2. https://www.gov.uk/government/collections/dft-departmental-spending-over-25000
3. A new API `/api/top_suppliers` should accept a POST request containing (optional) buyer name and time range (from/to timestamps in ISO format) and return an object containing an array supplier names & total values

   Sample request:

   ```tsx
   {
      "buyer_name": "HMRC",
      "from_date": "20210101",
      "to_date": "20210131",
   }
   ```

   or:

   ```tsx
   {
      "from_date": "20210101",
      "to_date": "20210131",
   }
   ```

   Sample response:

   ```tsx
   {
      "top_suppliers": [
         { "name": "Stotles", "total_amount": 1234567.0 }
      ]
   }
   ```

4. In the README file, please make a note of the result of the query for HMRC for all transactions in 2021.

## Code structure

The codebase is composed of:

- `load-file.main.ts` - script used to load a single CSV file from disk
- `fetch-transaction-data.main.ts` - script used to fetch data from gov.uk API
- `query-service.main.ts` - HTTP API server for querying the data

Some shared code has been extracted to other files - `db.ts` & `scraperUtils.ts` -
feel free to refactor the code more if needed.

### Libraries

The code makes use of the following libraries:

- expressjs - [documentation](https://expressjs.com/)
- knex - [documentation](https://knexjs.org/)
- luxon - [documentation](https://moment.github.io/luxon/)

## Getting started

You can run `ts-node` to execute each of these or use scripts defined in package.json:

```bash
# Starts the query service with --watch so it auto-reloads
npm run dev-query-service
# Runs the scraper
npm run dev-fetch-transaction-data
# Runs the file loader
npm run dev-load-file
```

The first time you run any script that accesses the db (calls `getDBConnection()`),
it will create db.sqlite3 file if it doesn't exist.

At any point you can delete that file and it will be recreated from scratch.

### Browsing the database

You should start by looking at the migration in `./migrations` folder.
If you prefer to browse the DB using SQL, you can use the sqlite command line (just run `sqlite3 ./db.sqlite3`)
or any other SQL client that supports sqlite.

If for any reason the database becomes unusable, you can just delete the db.sqlite3 file and it will be recreated (including running the migrations) next time you run any script.

### Disabling/Enabling TypeScript

If you prefer to completely disable TypeScript for a file, add `// @ts-nocheck` on the first line.
If you just want to disable strict type checking, modify `tsconfig.json` according to your needs.



# Candidate's notes
Hello! Thank you for taking a look at this submission.

I tried to keep to the design which we discussed in the Design challenge last week.


## Running the application
Start the suppliers and urls APIs
```
npx ts-node apis/suppliers/index.ts
npx ts-node apis/urls/index.ts
```

Start the data pipeline
```
npx ts-node data_pipeline/src/index.ts
```

Instructions on how to call the API are in the API readme files but here's a few examples:
```
curl http://localhost:3000/api/suppliers/stats
```

```
curl -s -H 'Content-Type: application/json' \
  -d '{ "buyer_name": "HMRC", "from_date": "2022-01-01", "to_date": "2022-01-31", "limit": "5"}' \
  -X POST \
  http://localhost:3000/api/suppliers/top-suppliers | jq '.'
```
('limit' is optional)


```
curl -s -H 'Content-Type: application/json' \
  -d '{ "supplier_name": "HMRC"}' \
  -X POST \
  http://localhost:3000/api/suppliers/supplier_stats
```



The application is broken into a few parts:

### Data Pipeline

#### URLFrontier
- calls the /api/urls/unvisited endpoint to get URLs for processing
- extracts links from urls
- places Tasks on a Queue which manages the 'politeness' of the app by adding a delay and concurrency limit

#### Downloader
- extracts csv links from secondary pages
- parses csv into SpendTransactions and writes to the spend_transactions table

### APIs
#### suppliers
- adds the top-suppliers endpoint to the existing endpoints

#### urls
- seeds a couple of urls to the database and returns them in an endpoint.
  This could be extended to accept new URLs that are found by Downloader jobs

### Tests
I've added new tests with mocks to capture the refactored code.
- data_pipeline/tests/Downloader.test.ts
- data_pipeline/tests/URLFrontier.test.ts

## Improvements needed
- I wanted to deal with error handling by logging and saving failed jobs to the DB but time got away from me.
- more unit tests
- Integration tests would be good. Although I think that by injecting dependencies, pretty much all lines are covered.
- probably a lot of style issues and minor things missed in a rush
- would benefit from dockerising apps and adding docker-compose config
- The api doesn't handle timestamps of this format as expected `{ "from_date": "20210101" }`. Instead they accept `{ "from_date": "2022-01-01" }`.
