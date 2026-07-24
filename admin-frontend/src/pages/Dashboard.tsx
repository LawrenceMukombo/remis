import React from 'react';

const Dashboard: React.FC = () => {
    const user = JSON.parse(localStorage.getItem('user') || '{}');

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <h1>Dashboard</h1>
                <div className="user-info">
                    <span>Welcome, {user.fullName || 'User'}</span>
                </div>
            </header>
            <main className="dashboard-content">
                <div className="card">
                    <h3>Overview</h3>
                    <p>Welcome to the REMIS Admin Dashboard.</p>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
