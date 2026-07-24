import React, { useState, useEffect } from 'react';
import {
    Plus, Kanban, Zap, Trash2, Calendar, User,
    MoreHorizontal, CheckCircle
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './WorkflowsPage.css';

interface Task {
    id: string;
    title: string;
    description: string;
    status: string;
    priority: string;
    dueDate: string;
    assignedTo: string;
    assignee?: { full_name: string };
}

interface Rule {
    id: string;
    name: string;
    triggerKey: string;
    actionType: string;
    isActive: boolean;
}

const WorkflowsPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'tasks' | 'rules'>('tasks');
    const [tasks, setTasks] = useState<Task[]>([]);
    const [rules, setRules] = useState<Rule[]>([]);
    const [showTaskModal, setShowTaskModal] = useState(false);

    // New Task Form State
    const [newTask, setNewTask] = useState({
        title: '',
        description: '',
        priority: 'MEDIUM',
        dueDate: '',
        status: 'TODO'
    });

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;

    useEffect(() => {
        if (activeTab === 'tasks') fetchTasks();
        else fetchRules();
    }, [activeTab]);

    const fetchTasks = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/workflows/tasks?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setTasks(data);
        } catch (error) {
            console.error(error);
        }
    };

    const fetchRules = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/workflows/rules?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setRules(data);
        } catch (error) {
            console.error(error);
        }
    };

    const handleCreateTask = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/workflows/tasks', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...newTask, tenantId, createdBy: user.id })
            });
            if (res.ok) {
                setShowTaskModal(false);
                fetchTasks();
                setNewTask({ title: '', description: '', priority: 'MEDIUM', dueDate: '', status: 'TODO' });
            }
        } catch (error) {
            console.error(error);
        }
    };

    const handleToggleRule = async (id: string, currentStatus: boolean) => {
        try {
            const res = await fetch(`http://localhost:4000/api/workflows/rules/${id}/toggle`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ isActive: !currentStatus })
            });
            if (res.ok) fetchRules();
        } catch (error) {
            console.error(error);
        }
    };

    const cols = ['TODO', 'IN_PROGRESS', 'REVIEW', 'DONE'];

    return (
        <div className="workflows-page">
            <div className="workflows-header">
                <div>
                    <h1 style={{ fontSize: '1.5rem', fontWeight: 'bold' }}>Workflows & Automation</h1>
                    <p style={{ color: '#6b7280' }}>Manage tasks and automate business processes.</p>
                </div>
                {activeTab === 'tasks' && (
                    <button className="action-btn" onClick={() => setShowTaskModal(true)}>
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> New Task
                    </button>
                )}
            </div>

            <div className="workflows-tabs">
                <button
                    className={`tab-btn ${activeTab === 'tasks' ? 'active' : ''}`}
                    onClick={() => setActiveTab('tasks')}
                >
                    <Kanban size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
                    Tasks & Projects
                </button>
                <button
                    className={`tab-btn ${activeTab === 'rules' ? 'active' : ''}`}
                    onClick={() => setActiveTab('rules')}
                >
                    <Zap size={16} style={{ display: 'inline', marginRight: 8, verticalAlign: 'text-bottom' }} />
                    Automation Rules
                </button>
            </div>

            {activeTab === 'tasks' ? (
                <div className="kanban-board">
                    {cols.map(col => (
                        <div key={col} className="kanban-column">
                            <div className="column-header">
                                <span>{col.replace('_', ' ')}</span>
                                <span style={{ fontSize: '0.75rem', background: '#e5e7eb', padding: '2px 8px', borderRadius: 99 }}>
                                    {tasks.filter(t => t.status === col).length}
                                </span>
                            </div>
                            <div className="task-list">
                                {tasks.filter(t => t.status === col).map(task => (
                                    <div key={task.id} className="task-card">
                                        <div className="task-title">{task.title}</div>
                                        <div style={{ fontSize: '0.8rem', color: '#4b5563', marginBottom: '0.5rem' }}>
                                            {task.description}
                                        </div>
                                        <div className="task-meta">
                                            <span className={`priority-badge priority-${task.priority}`}>
                                                {task.priority}
                                            </span>
                                            {task.dueDate && (
                                                <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                    <Calendar size={12} />
                                                    {new Date(task.dueDate).toLocaleDateString()}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="rules-grid">
                    {rules.map(rule => (
                        <div key={rule.id} className="rule-card">
                            <div className="rule-header">
                                <div>
                                    <div className="rule-name">{rule.name}</div>
                                    <div className="rule-trigger">Trigger: {rule.triggerKey}</div>
                                </div>
                                <div
                                    className={`toggle-switch ${rule.isActive ? 'active' : ''}`}
                                    onClick={() => handleToggleRule(rule.id, rule.isActive)}
                                >
                                    <div className="toggle-knob" />
                                </div>
                            </div>
                            <div className="rule-action">Action: {rule.actionType}</div>
                        </div>
                    ))}
                    {rules.length === 0 && (
                        <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '3rem', color: '#6b7280', background: '#f9fafb', borderRadius: 12 }}>
                            <Zap size={48} style={{ opacity: 0.2, marginBottom: '1rem' }} />
                            <p>No automation rules configured.</p>
                            <p style={{ fontSize: '0.875rem' }}>Create rules to automate repetitive tasks.</p>
                            {/* MVP: No create rule UI yet, just listing */}
                        </div>
                    )}
                </div>
            )}

            {/* Create Task Modal */}
            {showTaskModal && (
                <div style={{
                    position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
                    backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 1000,
                    display: 'flex', justifyContent: 'center', alignItems: 'center'
                }}>
                    <div style={{
                        backgroundColor: 'white', borderRadius: '12px', width: '500px',
                        padding: '1.5rem', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)'
                    }}>
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 'bold', marginBottom: '1rem' }}>Create New Task</h2>
                        <form onSubmit={handleCreateTask}>
                            <div style={{ display: 'grid', gap: '1rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Title</label>
                                    <input
                                        required
                                        type="text"
                                        value={newTask.title}
                                        onChange={e => setNewTask({ ...newTask, title: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Description</label>
                                    <textarea
                                        value={newTask.description}
                                        onChange={e => setNewTask({ ...newTask, description: e.target.value })}
                                        style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px', minHeight: '80px' }}
                                    />
                                </div>
                                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Priority</label>
                                        <select
                                            value={newTask.priority}
                                            onChange={e => setNewTask({ ...newTask, priority: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                        >
                                            <option value="LOW">Low</option>
                                            <option value="MEDIUM">Medium</option>
                                            <option value="HIGH">High</option>
                                            <option value="URGENT">Urgent</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label style={{ display: 'block', fontWeight: '500', marginBottom: '0.25rem' }}>Due Date</label>
                                        <input
                                            type="date"
                                            value={newTask.dueDate}
                                            onChange={e => setNewTask({ ...newTask, dueDate: e.target.value })}
                                            style={{ width: '100%', padding: '0.5rem', border: '1px solid #d1d5db', borderRadius: '6px' }}
                                        />
                                    </div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '0.5rem', marginTop: '1.5rem' }}>
                                <button type="button" onClick={() => setShowTaskModal(false)} style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #d1d5db', background: 'white', cursor: 'pointer' }}>Cancel</button>
                                <button type="submit" style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: 'none', background: '#4f46e5', color: 'white', cursor: 'pointer' }}>Create Task</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default WorkflowsPage;
