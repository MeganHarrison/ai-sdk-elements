import { migrate } from 'drizzle-orm/postgres-js/migrator';
import { migrationDb } from './index';
import * as dotenv from 'dotenv';

dotenv.config();

async function main() {
  console.log('🔄 Running migrations...');
  
  try {
    await migrate(migrationDb, { 
      migrationsFolder: './src/lib/db/migrations' 
    });
    
    console.log('✅ Migrations completed successfully');
    process.exit(0);
  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  }
}

main();