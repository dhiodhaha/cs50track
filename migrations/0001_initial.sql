CREATE TABLE magic_tokens (
  digest TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL,
  used_at INTEGER
);
CREATE INDEX magic_tokens_expiration ON magic_tokens(expires_at);

CREATE TABLE auth_sessions (
  digest TEXT PRIMARY KEY,
  email TEXT NOT NULL,
  created_at INTEGER NOT NULL,
  expires_at INTEGER NOT NULL
);
CREATE INDEX auth_sessions_expiration ON auth_sessions(expires_at);

CREATE TABLE login_requests (
  id TEXT PRIMARY KEY,
  address_digest TEXT NOT NULL,
  source_digest TEXT NOT NULL,
  requested_at INTEGER NOT NULL
);
CREATE INDEX login_requests_address ON login_requests(address_digest, requested_at);
CREATE INDEX login_requests_source ON login_requests(source_digest, requested_at);

CREATE TABLE owner_state (
  email TEXT PRIMARY KEY,
  revision INTEGER NOT NULL DEFAULT 0 CHECK(revision >= 0),
  state_json TEXT,
  updated_at INTEGER NOT NULL
);

CREATE TABLE state_operations (
  email TEXT NOT NULL,
  operation_id TEXT NOT NULL,
  payload_digest TEXT NOT NULL,
  revision INTEGER NOT NULL,
  created_at INTEGER NOT NULL,
  PRIMARY KEY(email, operation_id)
);
