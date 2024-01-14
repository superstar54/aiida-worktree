import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './components/Home';
import WorkTreeTable from './components/WorkTreeTable';
import Data from './components/Data';
import WorkTreeItem from './components/WorkTreeItem';
import Settings from './components/Settings';
import Layout from './components/Layout'; // Import the Layout component
import AtomsItem from './components/AtomsItem'; // Import the AtomsItem component

import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Layout> {/* Wrap the routes with the Layout component */}
          <Routes>
            <Route path="/worktree" element={<WorkTreeTable />} />
            <Route path="/data" element={<Data />} />
            <Route path="/settings" element={<Settings />} />
            <Route path="/atoms" element={<AtomsItem />} /> {/* Use the AtomsItem component */}
            <Route path="/" element={<Home />} />
            <Route path="/worktree/:pk" element={<WorkTreeItem />} />
          </Routes>
        </Layout>
      </div>
    </Router>
  );
}

export default App;
