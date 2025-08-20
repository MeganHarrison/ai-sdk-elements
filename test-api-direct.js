// Test the API directly from Node.js
const fetch = require('node-fetch');

async function testAPI() {
  try {
    console.log('Testing API endpoint directly...');
    const response = await fetch('http://localhost:3003/api/insights?limit=2');
    
    if (!response.ok) {
      console.log('Response not OK:', response.status, response.statusText);
      const text = await response.text();
      console.log('Response body:', text);
      return;
    }
    
    const data = await response.json();
    console.log('Success! Got data:');
    console.log('- Total insights:', data.total);
    console.log('- Insights returned:', data.insights?.length);
    if (data.insights?.[0]) {
      console.log('- First insight:', {
        title: data.insights[0].title,
        type: data.insights[0].insight_type,
        project: data.insights[0].projects?.name
      });
    }
  } catch (error) {
    console.error('Error:', error.message);
  }
}

testAPI();
