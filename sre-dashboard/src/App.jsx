import { useState } from 'react';
import Login from './pages/Login';
import DashboardLayout from './pages/DashboardLayout';

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  return (
    <>
      {isAuthenticated ? (
        <DashboardLayout onLogout={() => setIsAuthenticated(false)} />
      ) : (
        <Login onLogin={setIsAuthenticated} />
      )}
    </>
  );
}

export default App;
