// App.js
import React from 'react';
import { BrowserRouter as Router, Route, Routes, Link } from 'react-router-dom';
import MenuBuilder from './components/MenuBuilder';
import TableBuilder from './components/TableBuilder';
import ViewConfigurator from './components/ViewConfigurator';

function App() {
  return (
    <Router>
      <div className="App">
        {/* Navigation Menu */}
        <nav>
          <ul>
            <li>
              <Link to="/menu-builder">Program Menu Items</Link>
            </li>
            <li>
              <Link to="/table-builder">Database Tables</Link>
            </li>
            <li>
              <Link to="/view-configurator">Views</Link>
            </li>
            {/* Add more links as needed */}
          </ul>
        </nav>

        {/* Route Definitions */}
        <Routes>
          <Route path="/menu-builder" element={<MenuBuilder />} />
          <Route path="/table-builder" element={<TableBuilder />} />
          <Route path="/view-configurator" element={<ViewConfigurator />} />
          {/* Home Route */}
          <Route
            path="/"
            element={
              <div>
                <h1>Welcome to the Configurator Application</h1>
                {/* Additional content */}
              </div>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
