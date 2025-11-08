-- Create lessons table for storing lesson content as JSON
CREATE TABLE IF NOT EXISTS lessons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  slug text UNIQUE NOT NULL,
  title text NOT NULL,
  content jsonb NOT NULL,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);

-- Create index on slug for faster lookups
CREATE INDEX IF NOT EXISTS idx_lessons_slug ON lessons(slug);

-- Add RLS (Row Level Security) policies if needed
-- For now, allow public read access
ALTER TABLE lessons ENABLE ROW LEVEL SECURITY;

-- Allow anyone to read lessons
CREATE POLICY "Lessons are viewable by everyone"
  ON lessons
  FOR SELECT
  USING (true);

-- Only allow authenticated users with admin role to insert/update/delete
-- Adjust this based on your security requirements
-- CREATE POLICY "Only admins can modify lessons"
--   ON lessons
--   FOR ALL
--   USING (auth.jwt() ->> 'role' = 'admin');
