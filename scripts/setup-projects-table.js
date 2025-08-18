#!/usr/bin/env node

/**
 * Setup script for creating the projects table in Supabase
 * 
 * To use this script:
 * 1. Go to your Supabase dashboard (https://supabase.com/dashboard)
 * 2. Select your project
 * 3. Go to SQL Editor
 * 4. Copy and paste the SQL from supabase/migrations/create_projects_table.sql
 * 5. Click "Run" to execute the SQL
 * 
 * This will create the projects table with sample data.
 */

const fs = require('fs');
const path = require('path');

console.log('📦 Projects Table Setup Instructions');
console.log('=====================================\n');

const migrationPath = path.join(__dirname, '..', 'supabase', 'migrations', 'create_projects_table.sql');

if (fs.existsSync(migrationPath)) {
  const sql = fs.readFileSync(migrationPath, 'utf8');
  
  console.log('The SQL migration file has been found at:');
  console.log(`📁 ${migrationPath}\n`);
  
  console.log('To set up the projects table in your Supabase database:\n');
  console.log('1. Go to your Supabase dashboard: https://supabase.com/dashboard');
  console.log('2. Select your project');
  console.log('3. Navigate to the SQL Editor (in the left sidebar)');
  console.log('4. Create a new query');
  console.log('5. Copy and paste the following SQL:\n');
  console.log('----------------------------------------');
  console.log('-- BEGIN SQL --');
  console.log(sql);
  console.log('-- END SQL --');
  console.log('----------------------------------------\n');
  console.log('6. Click "Run" to execute the SQL');
  console.log('7. The projects table will be created with sample data');
  console.log('\n✅ Once completed, the projects page should display the sample projects!');
} else {
  console.error('❌ Migration file not found at:', migrationPath);
  console.error('Please ensure the migration file exists.');
}