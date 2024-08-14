
Start the API
```
npx ts-node apis/audits/index.ts
```

### Sample requests
'limit' is optional
```
curl http://localhost:3002/api/audits
```

```
curl -s -H 'Content-Type: application/json' \
  -d '{ "from_date": "2024-08-01", "to_date": "2024-08-31", "limit": "5"}' \
  -X POST \
  http://localhost:3002/api/audits/deadletters | jq '.'
```
