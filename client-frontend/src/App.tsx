import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PropertyListing from './pages/PropertyListing';
import PropertyDetails from './pages/PropertyDetails';
import ApplicationFlow from './pages/ApplicationFlow';
import FieldDashboard from './pages/FieldDashboard';
import OwnerListingRegistration from './pages/OwnerListingRegistration';
import TenantHub from './pages/TenantHub';
import LandlordHub from './pages/LandlordHub';
import { SplashScreen } from './components/SplashScreen';

function App() {
    const [splashFinished, setSplashFinished] = useState(false);

    return (
        <Router>
            {!splashFinished && (
                <SplashScreen onComplete={() => setSplashFinished(true)} />
            )}
            <div className="app-container">
                <Routes>
                    <Route path="/" element={<PropertyListing />} />
                    <Route path="/list-property" element={<OwnerListingRegistration />} />
                    <Route path="/property/:id" element={<PropertyDetails />} />
                    <Route path="/apply/:id" element={<ApplicationFlow />} />
                    <Route path="/tenant-hub" element={<TenantHub />} />
                    <Route path="/landlord-hub" element={<LandlordHub />} />
                    <Route path="/field" element={<FieldDashboard />} />
                </Routes>
            </div>
        </Router>
    );
}

export default App;
