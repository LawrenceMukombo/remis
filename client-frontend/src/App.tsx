import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PropertyListing from './pages/PropertyListing';
import PropertyDetails from './pages/PropertyDetails';
import ApplicationFlow from './pages/ApplicationFlow';
import FieldDashboard from './pages/FieldDashboard';

function App() {
    return (
        <Router>
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<PropertyListing />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/apply/:id" element={<ApplicationFlow />} />
                    <Route path="/field" element={<FieldDashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
