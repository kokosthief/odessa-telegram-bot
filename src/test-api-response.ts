import axios from 'axios';

async function testAPIResponse() {
  console.log('🔍 Testing Hipsy.nl API response format...');
  
  const apiKey = '14288|n6b1TloPcUTwQRrJxtortKlRNB2yxL7QYSvDzkWCb26ec6a3';
  const organisationSlug = 'odessa-amsterdam-ecstatic-dance';
  
  try {
    console.log('Making API request...');
    
    const response = await axios.get(`https://api.hipsy.nl/v1/organisation/${organisationSlug}/events`, {
      headers: {
        'Authorization': `Bearer ${apiKey}`,
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
      },
      params: {
        page: 1,
        limit: 5,
        period: 'upcoming'
      },
      timeout: 10000,
    });
    
    console.log('✅ API Response Status:', response.status);
    console.log('✅ API Response Headers:', response.headers);
    console.log('✅ API Response Data Type:', typeof response.data);
    console.log('✅ API Response Data:', JSON.stringify(response.data, null, 2));
    
    if (Array.isArray(response.data)) {
      console.log('✅ Response is an array with', response.data.length, 'items');
      if (response.data.length > 0) {
        console.log('✅ First event structure:', JSON.stringify(response.data[0], null, 2));
      }
    } else if (response.data && typeof response.data === 'object') {
      console.log('✅ Response is an object with keys:', Object.keys(response.data));
      if (response.data.events && Array.isArray(response.data.events)) {
        console.log('✅ Events array found with', response.data.events.length, 'items');
        if (response.data.events.length > 0) {
          console.log('✅ First event structure:', JSON.stringify(response.data.events[0], null, 2));
        }
      }
    }
    
  } catch (error: any) {
    console.error('❌ API Error:', error.response?.status, error.response?.statusText);
    console.error('❌ Error Data:', error.response?.data);
    console.error('❌ Full Error:', error.message);
  }
}

// Run the test
testAPIResponse(); 