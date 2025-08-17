#!/bin/bash

echo "Exporting all meetings from remote database..."

# Export all meetings from remote in batches
for offset in 0 100 200 300 400 500 600 700 800; do
  echo "Exporting batch starting at $offset..."
  
  wrangler d1 execute alleato --remote --json --command="
    SELECT id, title, date, duration, participants, fireflies_id, summary, 
           project, category, priority, status, meeting_type, client, 
           attendees, department, word_count, follow_up_required,
           transcript_url, organizer_email, meeting_url
    FROM meetings 
    ORDER BY date DESC 
    LIMIT 100 OFFSET $offset
  " | jq -r '.[0].results[] | 
    "INSERT INTO meetings (id, title, date, duration, participants, fireflies_id, summary, project, category, priority, status, meeting_type, client, attendees, department, word_count, follow_up_required, transcript_url, organizer_email, meeting_url) VALUES (" +
    "\"" + (.id // "") + "\", " +
    "\"" + (.title // "" | gsub("\""; "\\\"")) + "\", " +
    "\"" + (.date // "") + "\", " +
    (if .duration then (.duration | tostring) else "NULL" end) + ", " +
    (if .participants then "\"" + (.participants | gsub("\""; "\\\"")) + "\"" else "NULL" end) + ", " +
    (if .fireflies_id then "\"" + .fireflies_id + "\"" else "NULL" end) + ", " +
    (if .summary then "\"" + (.summary | gsub("\""; "\\\"") | gsub("\n"; " ")) + "\"" else "NULL" end) + ", " +
    (if .project then "\"" + .project + "\"" else "NULL" end) + ", " +
    (if .category then "\"" + .category + "\"" else "NULL" end) + ", " +
    (if .priority then "\"" + .priority + "\"" else "NULL" end) + ", " +
    (if .status then "\"" + .status + "\"" else "NULL" end) + ", " +
    (if .meeting_type then "\"" + .meeting_type + "\"" else "NULL" end) + ", " +
    (if .client then "\"" + (.client | gsub("\""; "\\\"")) + "\"" else "NULL" end) + ", " +
    (if .attendees then "\"" + (.attendees | gsub("\""; "\\\"")) + "\"" else "NULL" end) + ", " +
    (if .department then "\"" + .department + "\"" else "NULL" end) + ", " +
    (if .word_count then (.word_count | tostring) else "NULL" end) + ", " +
    (if .follow_up_required then (.follow_up_required | tostring) else "0" end) + ", " +
    (if .transcript_url then "\"" + .transcript_url + "\"" else "NULL" end) + ", " +
    (if .organizer_email then "\"" + .organizer_email + "\"" else "NULL" end) + ", " +
    (if .meeting_url then "\"" + .meeting_url + "\"" else "NULL" end) +
    ");"' >> /tmp/meetings_import.sql
done

echo "Importing meetings to local database..."
wrangler d1 execute alleato --local --file=/tmp/meetings_import.sql

echo "Done! Imported all meetings."