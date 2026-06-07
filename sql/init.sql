CREATE TABLE IF NOT EXISTS users (
  id        UUID PRIMARY KEY,
  name      TEXT NOT NULL UNIQUE,
  email     TEXT,
  password  TEXT NOT NULL
);

CREATE TYPE cart_status AS ENUM ('OPEN', 'ORDERED');
CREATE TYPE order_status AS ENUM ('OPEN', 'APPROVED', 'CONFIRMED', 'SENT', 'COMPLETED', 'CANCELLED');

CREATE TABLE IF NOT EXISTS carts (
  id          UUID PRIMARY KEY,
  user_id     UUID        NOT NULL,
  created_at  TIMESTAMP   NOT NULL DEFAULT now(),
  updated_at  TIMESTAMP   NOT NULL DEFAULT now(),
  status      cart_status NOT NULL DEFAULT 'OPEN'
);

CREATE TABLE IF NOT EXISTS cart_items (
  cart_id     UUID     NOT NULL REFERENCES carts(id) ON DELETE CASCADE,
  product_id  UUID     NOT NULL,
  count       INTEGER  NOT NULL CHECK (count > 0),
  PRIMARY KEY (cart_id, product_id)
);

CREATE TABLE IF NOT EXISTS orders (
  id          UUID PRIMARY KEY,
  user_id     UUID         NOT NULL,
  cart_id     UUID         NOT NULL REFERENCES carts(id),
  payment     JSONB,
  delivery    JSONB,
  comments    TEXT,
  status      order_status NOT NULL DEFAULT 'OPEN',
  total       NUMERIC(10, 2) NOT NULL DEFAULT 0
);

-- Seed data
INSERT INTO carts (id, user_id, created_at, updated_at, status) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'b0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', now(), now(), 'OPEN'),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'b1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', now(), now(), 'ORDERED')
ON CONFLICT DO NOTHING;

INSERT INTO cart_items (cart_id, product_id, count) VALUES
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 2),
  ('a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 'c1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 1),
  ('a1eebc99-9c0b-4ef8-bb6d-6bb9bd380a12', 'c0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', 3)
ON CONFLICT DO NOTHING;
