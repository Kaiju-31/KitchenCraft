-- KitchenCraft Database Initialization Script
-- This script runs when PostgreSQL container starts for the first time

-- Ensure database exists (should already be created by POSTGRES_DB env var)
-- CREATE DATABASE IF NOT EXISTS kitchencraft;

-- Connect to kitchencraft database
\c kitchencraft;

-- Create extensions if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Set timezone
SET timezone = 'UTC';

-- Log initialization
DO $$
BEGIN
  RAISE NOTICE 'KitchenCraft database initialized successfully!';
END $$;