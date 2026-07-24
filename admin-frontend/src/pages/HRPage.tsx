import React, { useState, useEffect } from 'react';
import { Plus, Users, Mail, Phone, Briefcase, X, Calendar, Trash2, Award, UserCheck } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './HRPage.css';

interface Employee {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    title: string;
    department: string;
    hireDate: string;
    status: string;
}

const HRPage: React.FC = () => {
    const [employees, setEmployees] = useState<Employee[]>([]);
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        email: '',
        phone: '',
        title: '',
        department: '',
        hireDate: new Date().toISOString().split('T')[0],
        status: 'ACTIVE'
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    useEffect(() => {
        fetchEmployees();
    }, []);

    const fetchEmployees = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/employees?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) {
                setEmployees(data);
            }
        } catch (error) {
            console.error('Error fetching employees:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/employees', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...formData, tenantId })
            });

            if (!res.ok) throw new Error('Failed to create employee');

            showToast('Employee added successfully', 'success');
            setShowModal(false);
            setFormData({
                firstName: '',
                lastName: '',
                email: '',
                phone: '',
                title: '',
                department: '',
                hireDate: new Date().toISOString().split('T')[0],
                status: 'ACTIVE'
            });
            fetchEmployees();
        } catch (error) {
            console.error('Error creating employee:', error);
            showToast('Failed to add employee', 'error');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this employee record?')) return;
        try {
            const res = await fetch(`http://localhost:4000/api/employees/${id}`, {
                method: 'DELETE'
            });
            if (res.ok) {
                showToast('Employee record deleted', 'success');
                fetchEmployees();
            }
        } catch (error) {
            console.error('Error deleting employee:', error);
        }
    };

    return (
        <div className="hr-page">
            <div className="hr-header">
                <div className="hr-title">
                    <h1>Human Resources</h1>
                    <p>Manage staff, roles, and organizational departments.</p>
                </div>
                <div className="hr-actions">
                    <button className="create-btn" onClick={() => setShowModal(true)}>
                        <Plus size={18} />
                        Hire Employee
                    </button>
                </div>
            </div>

            <div className="hr-stats-grid">
                <div className="stat-card">
                    <div className="stat-icon stat-icon-staff">
                        <Users size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Total Staff</span>
                        <span className="stat-value">{employees.length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-active">
                        <UserCheck size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Active</span>
                        <span className="stat-value">{employees.filter(e => e.status === 'ACTIVE').length}</span>
                    </div>
                </div>
                <div className="stat-card">
                    <div className="stat-icon stat-icon-dept">
                        <Award size={20} />
                    </div>
                    <div className="stat-info">
                        <span className="stat-label">Departments</span>
                        <span className="stat-value">{new Set(employees.map(e => e.department)).size}</span>
                    </div>
                </div>
            </div>

            {/* Hire Employee Modal */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="hr-modal">
                        <div className="modal-header">
                            <h2>Begin Onboarding</h2>
                            <button className="close-btn" onClick={() => setShowModal(false)} title="Close Modal" aria-label="Close Modal"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreateEmployee} className="hr-form">
                            <div className="form-row">
                                <div className="form-group">
                                    <label>First Name</label>
                                    <input required type="text" value={formData.firstName} onChange={(e) => setFormData({ ...formData, firstName: e.target.value })} placeholder="John" />
                                </div>
                                <div className="form-group">
                                    <label>Last Name</label>
                                    <input required type="text" value={formData.lastName} onChange={(e) => setFormData({ ...formData, lastName: e.target.value })} placeholder="Doe" />
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Work Email</label>
                                    <div className="input-with-icon">
                                        <Mail size={16} />
                                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} placeholder="j.doe@company.com" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label>Phone Number</label>
                                    <div className="input-with-icon">
                                        <Phone size={16} />
                                        <input type="text" value={formData.phone} onChange={(e) => setFormData({ ...formData, phone: e.target.value })} placeholder="+1 (555) 000-0000" />
                                    </div>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Job Title</label>
                                    <div className="input-with-icon">
                                        <Briefcase size={16} />
                                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="Property Manager" />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="dept-select">Department</label>
                                    <select
                                        id="dept-select"
                                        title="Select Department"
                                        value={formData.department}
                                        onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                                    >
                                        <option value="">Select Department</option>
                                        <option value="Operations">Operations</option>
                                        <option value="Finance">Finance</option>
                                        <option value="Maintenance">Maintenance</option>
                                        <option value="Sales">Sales</option>
                                        <option value="Legal">Legal</option>
                                        <option value="Security">Security</option>
                                    </select>
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label>Hire Date</label>
                                    <div className="input-with-icon">
                                        <Calendar size={16} />
                                        <input type="date" value={formData.hireDate} onChange={(e) => setFormData({ ...formData, hireDate: e.target.value })} />
                                    </div>
                                </div>
                                <div className="form-group">
                                    <label htmlFor="status-select">Initial Status</label>
                                    <select
                                        id="status-select"
                                        title="Initial Status"
                                        value={formData.status}
                                        onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                                    >
                                        <option value="ACTIVE">Active</option>
                                        <option value="ONBOARDING">Onboarding</option>
                                        <option value="PROBATION">Probation</option>
                                    </select>
                                </div>
                            </div>

                            <div className="modal-footer">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
                                <button type="submit" className="submit-btn">Complete Hire</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            <div className="hr-table-container">
                {loading ? (
                    <div className="hr-loading">Loading personnel records...</div>
                ) : employees.length === 0 ? (
                    <div className="hr-empty">
                        <Users size={64} />
                        <h3>Your workforce is empty</h3>
                        <p>No employees found. Start by hiring your first team member.</p>
                        <button className="create-btn" onClick={() => setShowModal(true)}>Hire Employee</button>
                    </div>
                ) : (
                    <table className="hr-table">
                        <thead>
                            <tr>
                                <th>Personnel</th>
                                <th>Role & Dept</th>
                                <th>Contact</th>
                                <th>Joined</th>
                                <th>Status</th>
                                <th></th>
                            </tr>
                        </thead>
                        <tbody>
                            {employees.map(emp => (
                                <tr key={emp.id}>
                                    <td>
                                        <div className="personnel-info">
                                            <div className="avatar">{emp.firstName[0]}{emp.lastName[0]}</div>
                                            <div className="name-box">
                                                <span className="full-name">{emp.firstName} {emp.lastName}</span>
                                                <span className="staff-id">#{emp.id.slice(0, 8)}</span>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="role-box">
                                            <span className="job-title">{emp.title}</span>
                                            <span className="dept-tag">{emp.department}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <div className="contact-box">
                                            <span>{emp.email}</span>
                                            <span className="sub-text">{emp.phone}</span>
                                        </div>
                                    </td>
                                    <td>
                                        <span className="join-date">{new Date(emp.hireDate).toLocaleDateString()}</span>
                                    </td>
                                    <td>
                                        <span className={`status-pill pill-${emp.status.toLowerCase()}`}>
                                            {emp.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button
                                            className="delete-action-btn"
                                            onClick={() => handleDelete(emp.id)}
                                            title="Delete Employee"
                                            aria-label="Delete Employee"
                                        >
                                            <Trash2 size={16} />
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
};

export default HRPage;
