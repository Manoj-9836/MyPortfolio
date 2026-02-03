// Quick test to verify education API
const testEducationAPI = async () => {
  try {
    console.log('Testing Education API...\n');
    
    // Test GET - should return default data if empty
    const response = await fetch('http://localhost:5000/api/portfolio/education');
    const data = await response.json();
    
    console.log('✅ GET /api/portfolio/education');
    console.log('Status:', response.status);
    console.log('Data:', JSON.stringify(data, null, 2));
    console.log('\n📊 Education entries:', data.length);
    
    if (data.length > 0) {
      console.log('\n📝 Sample entry:');
      console.log('  Institution:', data[0].institution);
      console.log('  Degree:', data[0].degree);
      console.log('  GPA:', data[0].gpa);
      console.log('  Current:', data[0].current ? 'Yes' : 'No');
    }
    
  } catch (error) {
    console.error('❌ Error:', error.message);
  }
};

testEducationAPI();
