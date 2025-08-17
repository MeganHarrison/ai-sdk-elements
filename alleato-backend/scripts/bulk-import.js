const { execSync } = require('child_process');

async function bulkImport() {
  console.log('Starting bulk import of meetings...');
  
  // Get total count
  const countResult = execSync('wrangler d1 execute alleato --remote --json --command="SELECT COUNT(*) as total FROM meetings"', { encoding: 'utf8' });
  const total = JSON.parse(countResult)[0].results[0].total;
  console.log(`Total meetings to import: ${total}`);
  
  // Import in batches
  const batchSize = 100;
  let imported = 50; // We already have 50
  
  for (let offset = 50; offset < total; offset += batchSize) {
    console.log(`Importing batch ${offset} to ${Math.min(offset + batchSize, total)}...`);
    
    try {
      // Export batch
      const exportCmd = `wrangler d1 execute alleato --remote --json --command="SELECT * FROM meetings LIMIT ${batchSize} OFFSET ${offset}"`;
      const exportResult = execSync(exportCmd, { encoding: 'utf8' });
      const meetings = JSON.parse(exportResult)[0].results;
      
      // Create SQL statements
      let sql = '';
      for (const meeting of meetings) {
        const id = meeting.id;
        const title = (meeting.title || '').replace(/'/g, "''").replace(/"/g, '""');
        const date = meeting.date;
        const duration = meeting.duration || 'NULL';
        const status = meeting.status ? `'${meeting.status}'` : 'NULL';
        const meetingType = meeting.meeting_type ? `'${meeting.meeting_type}'` : 'NULL';
        const client = meeting.client ? `'${meeting.client.replace(/'/g, "''")}'` : 'NULL';
        
        sql += `INSERT OR IGNORE INTO meetings (id, title, date, duration, status, meeting_type, client) VALUES ('${id}', '${title}', '${date}', ${duration}, ${status}, ${meetingType}, ${client});\n`;
      }
      
      // Write to temp file and import
      require('fs').writeFileSync('/tmp/batch_import.sql', sql);
      execSync('wrangler d1 execute alleato --local --file=/tmp/batch_import.sql');
      
      imported += meetings.length;
      console.log(`Imported ${imported} meetings so far...`);
      
    } catch (error) {
      console.error(`Error importing batch at offset ${offset}:`, error.message);
    }
  }
  
  console.log('Import complete!');
  
  // Verify final count
  const finalCount = execSync('wrangler d1 execute alleato --local --json --command="SELECT COUNT(*) as total FROM meetings"', { encoding: 'utf8' });
  const localTotal = JSON.parse(finalCount)[0].results[0].total;
  console.log(`Total meetings in local database: ${localTotal}`);
}

bulkImport().catch(console.error);