CREATE TABLE transaction_dead_letter (
  id INTEGER PRIMARY KEY,
  buyer_name TEXT NOT NULL,
  supplier_name TEXT NOT NULL,
  amount TEXT NOT NULL,
  transaction_timestamp TEXT NOT NULL, -- iso8601 format
  pipeline_timestamp TEXT NOT NULL,
  error_message TEXT
) STRICT;
