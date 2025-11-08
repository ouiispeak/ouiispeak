# Lesson Migration Scripts

## Setup Instructions

### 1. Create the Lessons Table

Run the SQL migration in your Supabase dashboard:

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `scripts/create-lessons-table.sql`
4. Run the SQL

Alternatively, you can use the Supabase CLI:
```bash
supabase db push
```

### 2. Populate the Table

Install `tsx` if you haven't already (for running TypeScript scripts):
```bash
npm install -D tsx
```

Then run the populate script:
```bash
npx tsx scripts/populate-lessons.ts
```

Or if you prefer using node with a loader:
```bash
node --loader ts-node/esm scripts/populate-lessons.ts
```

The script will:
- Load both lesson JSON files from `src/data/lessons/`
- Insert/update them in the Supabase `lessons` table
- Use `upsert` so it's safe to run multiple times

### 3. Verify

Check that the lessons are in your Supabase table:
- Go to Table Editor in Supabase dashboard
- Select the `lessons` table
- You should see 2 rows:
  - `intro/how-ouii-speak-works`
  - `module-1/lesson-1`
