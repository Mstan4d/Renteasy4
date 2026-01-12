import React from 'react';

const TestPage = () => {
  console.log('TestPage rendering');
  
  return (
    <div style={{padding: '20px', background: '#f0f0f0'}}>
      <h1>🎯 TEST PAGE - SUPER ADMIN</h1>
      <p>If you can see this, routing works!</p>
      <div style={{background: 'white', padding: '20px', marginTop: '20px'}}>
        <h3>LocalStorage Data:</h3>
        <pre>
          {JSON.stringify({
            token: localStorage.getItem('superAdminToken') ? 'Present' : 'Missing',
            data: JSON.parse(localStorage.getItem('superAdminData') || '{}'),
            time: new Date().toLocaleTimeString()
          }, null, 2)}
        </pre>
      </div>
    </div>
  );
};

export default TestPage;