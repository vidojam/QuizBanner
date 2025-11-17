// Simple backend connection test
// Using Node.js built-in fetch (Node 18+)

async function testBackendConnection() {
  console.log('🔄 Testing backend connection...\n');
  
  try {
    const response = await fetch('http://localhost:5000/api/health');
    
    if (response.ok) {
      const data = await response.json();
      console.log('✅ SUCCESS! Backend is running properly');
      console.log(`📊 Status: ${data.status}`);
      console.log(`🌍 Environment: ${data.environment}`);
      console.log(`⏰ Server Time: ${new Date(data.timestamp).toLocaleString()}`);
      console.log('\n🎉 Your QuizBanner backend is ready for mobile app connections!');
    } else {
      console.log(`❌ FAILED! Server returned status: ${response.status}`);
    }
  } catch (error) {
    console.log('❌ FAILED! Could not connect to backend');
    console.log(`💡 Error: ${error.message}`);
    console.log('\n🔧 Make sure your backend server is running with: npm run dev');
  }
}

// Also test if the server accepts CORS requests (important for web/mobile)
async function testCORS() {
  console.log('\n🔄 Testing CORS configuration...');
  
  try {
    const response = await fetch('http://localhost:5000/api/health', {
      method: 'OPTIONS',
      headers: {
        'Origin': 'http://localhost:8081',
        'Access-Control-Request-Method': 'GET'
      }
    });
    
    if (response.ok || response.status === 200) {
      console.log('✅ CORS is properly configured');
    } else {
      console.log('⚠️  CORS might need configuration for mobile app');
    }
  } catch (error) {
    console.log('⚠️  Could not test CORS configuration');
  }
}

// Run the tests
testBackendConnection().then(() => testCORS());