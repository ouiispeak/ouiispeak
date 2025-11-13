#!/usr/bin/env tsx
/**
 * Script to populate Supabase lessons table from JSON files
 * Usage: npx tsx scripts/populate-lessons.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { join } from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  console.error('Error: NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY must be set');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseKey);

async function loadLessonJson(filename: string) {
  const filePath = join(process.cwd(), 'src', 'data', 'lessons', filename);
  const content = await readFile(filePath, 'utf-8');
  return JSON.parse(content);
}

async function populateLessons() {
  console.log('Loading lessons from JSON files...');

  const lessons = [
    await loadLessonJson('intro.json'),
    await loadLessonJson('module-1-lesson-1.json'),
  ];

  console.log(`Found ${lessons.length} lessons to insert`);

  for (const lesson of lessons) {
    console.log(`\nInserting lesson: ${lesson.slug} (${lesson.title})`);
    
    const { error } = await supabase
      .from('lessons')
      .upsert({
        slug: lesson.slug,
        title: lesson.title,
        content: {
          id: lesson.id,
          slug: lesson.slug,
          title: lesson.title,
          slides: lesson.slides,
        },
      }, {
        onConflict: 'slug',
      })
      .select();

    if (error) {
      console.error(`Error inserting lesson ${lesson.slug}:`, error);
    } else {
      console.log(`✅ Successfully inserted/updated: ${lesson.slug}`);
    }
  }

  console.log('\n✅ Done!');
}

populateLessons().catch((error) => {
  console.error('Fatal error:', error);
  process.exit(1);
});
