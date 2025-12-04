/*
  # Personal Expense Tracker - Initial Schema

  ## Overview
  Creates the core expenses table for tracking personal spending with categories,
  amounts, dates, and descriptions.

  ## New Tables
  
  ### `expenses`
  - `id` (uuid, primary key) - Unique identifier for each expense
  - `user_id` (uuid) - References auth.users, tracks expense owner
  - `amount` (decimal) - Expense amount with 2 decimal precision
  - `category` (text) - Expense category (food, transport, entertainment, etc.)
  - `description` (text) - Optional expense description
  - `date` (date) - Date when expense occurred
  - `created_at` (timestamptz) - Timestamp of record creation

  ## Security
  
  ### Row Level Security (RLS)
  - RLS enabled on expenses table
  - Users can only view their own expenses (SELECT policy)
  - Users can only insert their own expenses (INSERT policy)
  - Users can only update their own expenses (UPDATE policy)
  - Users can only delete their own expenses (DELETE policy)

  ## Important Notes
  1. All policies require authentication
  2. All policies verify user_id matches auth.uid()
  3. Decimal precision set to handle currency amounts accurately
*/

CREATE TABLE IF NOT EXISTS expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  amount decimal(10, 2) NOT NULL,
  category text NOT NULL,
  description text DEFAULT '',
  date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz DEFAULT now()
);

ALTER TABLE expenses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own expenses"
  ON expenses FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own expenses"
  ON expenses FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own expenses"
  ON expenses FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete own expenses"
  ON expenses FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_expenses_user_id ON expenses(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date DESC);