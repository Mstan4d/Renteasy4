import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';

const TestHome = () => (
  <div style={{ padding: '50px', textAlign: 'center' }}>
    <h1>Test Home</h1>
    <a href="/super-admin/command-center">Go to Command Center</a>
  </div>
);

const TestCommandCenter = () => (
  <div style={{ padding: '50px', background: 'lightblue' }}>
    <h1>Test Command Center</h1>
    <a href="/">Go Home</a>
  </div>
);

function AppTest() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<TestHome />} />
        <Route path="/super-admin/command-center" element={<TestCommandCenter />} />
      </Routes>
    </Router>
  );
}

export default AppTest;