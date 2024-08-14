
Start the API
```
npx ts-node apis/suppliers/index.ts
```

### Sample requests

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
