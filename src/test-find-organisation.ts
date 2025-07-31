import axios from 'axios';

async function findOrganisation() {
  console.log('🔍 Finding the correct organisation slug...');
  
  const apiKey = '14288|n6b1TloPcUTwQRrJxtortKlRNB2yxL7QYSvDzkWCb26ec6a3';
  
  try {
    // First, let's try to list all organisations to find the right one
    console.log('1. Trying to list organisations...');
    
    const response = await axios.get('https://api.hipsy.nl/v1/organisations', {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      timeout: 10000,
    });
    
    console.log('✅ Organisations found:', response.data);
    
  } catch (error: any) {
    console.log('❌ Could not list organisations:', error.response?.data || error.message);
    
    // Let's try some common variations of the organisation slug
    const possibleSlugs = [
      'odessa',
      'odessa-boat',
      'odessa-amsterdam',
      'team-odessa',
      'teamodessa',
      'odessa-events',
      'odessa-dance',
      'odessa-ecstatic'
    ];
    
    console.log('\n2. Trying different organisation slugs...');
    
    for (const slug of possibleSlugs) {
      try {
        console.log(`   Testing slug: ${slug}`);
        
        const testResponse = await axios.get(`https://api.hipsy.nl/v1/organisation/${slug}/events`, {
          headers: {
            'Authorization': `Bearer ${apiKey}`,
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          },
          params: {
            page: 1,
            limit: 1,
            period: 'upcoming'
          },
          timeout: 5000,
        });
        
        console.log(`✅ Found working slug: ${slug}`);
        console.log(`   Response:`, testResponse.data);
        return;
        
      } catch (slugError: any) {
        console.log(`   ❌ ${slug}: ${slugError.response?.status || 'Error'}`);
      }
    }
    
    console.log('\n❌ No working organisation slug found.');
    console.log('Please check the Hipsy dashboard for the correct organisation slug.');
  }
}

// Run the test
findOrganisation(); 