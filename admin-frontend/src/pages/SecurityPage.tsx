import React, { useState, useEffect } from 'react';
import {
    Shield, Users, Activity, Plus, Edit2, Trash2,
    Lock, CheckCircle, MapPin, Grid, Search, User as UserIcon, Key, Save, X
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import './SecurityPage.css';

interface Role {
    role_id: string;
    role_name: string;
    role_code: string;
    description: string;
    permissions: Permission[];
}

interface Permission {
    id: string;
    action: string;
    resource: string;
    description?: string;
}

interface User {
    user_id: string;
    full_name: string;
    email: string;
    role?: Role;
    role_id: string;
    groups: Group[];
    locationAccess: { locationId: string; location: { name: string } }[];
}

interface Group {
    id: string;
    name: string;
    description: string;
    _count?: { users: number };
}

interface AuditLog {
    id: string;
    action: string;
    resource: string;
    resourceId?: string;
    details?: any;
    createdAt: string;
    user?: { full_name: string; email: string };
}

interface Location {
    id: string;
    name: string;
    type?: string;
}

const SecurityPage: React.FC = () => {
    const [activeTab, setActiveTab] = useState<'users' | 'roles' | 'groups' | 'lbac' | 'permissions' | 'audit'>('users');
    const [users, setUsers] = useState<User[]>([]);
    const [roles, setRoles] = useState<Role[]>([]);
    const [groups, setGroups] = useState<Group[]>([]);
    const [permissions, setPermissions] = useState<Permission[]>([]);
    const [logs, setLogs] = useState<AuditLog[]>([]);
    const [locations, setLocations] = useState<Location[]>([]);

    // Modals
    const [showRoleModal, setShowRoleModal] = useState(false);
    const [showGroupModal, setShowGroupModal] = useState(false);
    const [showPermissionModal, setShowPermissionModal] = useState(false);
    const [showMembersModal, setShowMembersModal] = useState(false);

    // Edit States
    const [editingRole, setEditingRole] = useState<Role | null>(null);
    const [editingGroup, setEditingGroup] = useState<Group | null>(null);
    const [managingMembersGroup, setManagingMembersGroup] = useState<Group | null>(null);
    const [groupMembersIds, setGroupMembersIds] = useState<string[]>([]);
    const [selectedPermIds, setSelectedPermIds] = useState<string[]>([]);

    // Form State
    const [roleForm, setRoleForm] = useState({ role_name: '', description: '' });
    const [groupForm, setGroupForm] = useState({ name: '', description: '' });
    const [newPermission, setNewPermission] = useState({ action: '', resource: '', description: '' });

    const [editingUser, setEditingUser] = useState<User | null>(null);
    const [selectedRoleForUser, setSelectedRoleForUser] = useState('');
    const [selectedGroupsForUser, setSelectedGroupsForUser] = useState<string[]>([]);
    const [selectedLocationsForUser, setSelectedLocationsForUser] = useState<string[]>([]);

    const [searchTerm, setSearchTerm] = useState('');

    const user = JSON.parse(localStorage.getItem('user') || '{}');
    const tenantId = user.tenantId;
    const { showToast } = useToast();

    useEffect(() => {
        if (activeTab === 'roles') { fetchRoles(); fetchPermissions(); }
        else if (activeTab === 'users') { fetchUsers(); fetchRoles(); fetchGroups(); fetchLocations(); }
        else if (activeTab === 'groups') fetchGroups();
        else if (activeTab === 'lbac') { fetchUsers(); fetchLocations(); }
        else if (activeTab === 'permissions') fetchPermissions();
        else fetchAuditLogs();
        setSearchTerm('');
    }, [activeTab]);

    const fetchRoles = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/security/roles?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setRoles(data);
        } catch (error) { console.error(error); }
    };

    const fetchUsers = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/security/users?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setUsers(data);
        } catch (error) { console.error(error); }
    };

    const fetchGroups = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/security/groups?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setGroups(data);
        } catch (error) { console.error(error); }
    };

    const fetchLocations = async () => {
        try {
            console.log('Fetching locations for tenant:', tenantId);
            const res = await fetch(`http://localhost:4000/api/security/locations?tenantId=${tenantId}`);
            if (!res.ok) {
                const errorData = await res.json();
                console.error('Fetch locations failed:', errorData);
                return;
            }
            const data = await res.json();
            if (Array.isArray(data)) setLocations(data);
        } catch (error) {
            console.error('Fetch locations network/parse error:', error);
        }
    };

    const fetchAuditLogs = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/security/audit-logs?tenantId=${tenantId}`);
            const data = await res.json();
            if (Array.isArray(data)) setLogs(data);
        } catch (error) { console.error(error); }
    };

    const fetchPermissions = async () => {
        try {
            const res = await fetch(`http://localhost:4000/api/security/permissions`);
            const data = await res.json();
            if (Array.isArray(data)) setPermissions(data);
        } catch (error) { console.error(error); }
    };

    const handleSaveRole = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingRole
                ? `http://localhost:4000/api/security/roles/${editingRole.role_id}`
                : 'http://localhost:4000/api/security/roles';
            const method = editingRole ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...roleForm, tenant_id: tenantId, permissionIds: selectedPermIds })
            });

            if (res.ok) {
                showToast(`Role ${editingRole ? 'updated' : 'created'} successfully`, 'success');
                setShowRoleModal(false);
                setEditingRole(null);
                fetchRoles();
                setRoleForm({ role_name: '', description: '' });
                setSelectedPermIds([]);
            } else showToast('Failed to save role', 'error');
        } catch (error) { console.error(error); showToast('Error saving role', 'error'); }
    };

    const openEditRole = (role: Role) => {
        setEditingRole(role);
        setRoleForm({ role_name: role.role_name, description: role.description });
        setSelectedPermIds(role.permissions?.map(p => p.id) || []);
        setShowRoleModal(true);
    };

    const handleDeleteRole = async (roleId: string) => {
        if (!confirm('Are you sure you want to delete this role?')) return;
        try {
            await fetch(`http://localhost:4000/api/security/roles/${roleId}?tenantId=${tenantId}`, { method: 'DELETE' });
            fetchRoles();
            showToast('Role deleted', 'success');
        } catch (error) { console.error(error); }
    };

    const handleSaveGroup = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const url = editingGroup
                ? `http://localhost:4000/api/security/groups/${editingGroup.id}`
                : 'http://localhost:4000/api/security/groups';
            const method = editingGroup ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ ...groupForm, tenantId })
            });
            if (res.ok) {
                showToast(`Group ${editingGroup ? 'updated' : 'created'}`, 'success');
                setShowGroupModal(false);
                setEditingGroup(null);
                fetchGroups();
                setGroupForm({ name: '', description: '' });
            }
        } catch (error) { console.error(error); }
    };

    const openEditGroup = (group: Group) => {
        setEditingGroup(group);
        setGroupForm({ name: group.name, description: group.description });
        setShowGroupModal(true);
    };

    const handleDeleteGroup = async (groupId: string) => {
        if (!confirm('Delete this group?')) return;
        try {
            await fetch(`http://localhost:4000/api/security/groups/${groupId}`, { method: 'DELETE' });
            fetchGroups();
            showToast('Group deleted', 'success');
        } catch (error) { console.error(error); }
    };

    const openManageMembers = async (group: Group) => {
        setManagingMembersGroup(group);
        // We need users for this group. Let's fetch the list of users and see who is in the group.
        // For efficiency, we can filter existing 'users' state if they are loaded, or re-fetch.
        if (users.length === 0) await fetchUsers();

        // Find users who have this group in their 'groups' array
        setGroupMembersIds(users.filter(u => u.groups?.some(g => g.id === group.id)).map(u => u.user_id));
        setShowMembersModal(true);
    };

    const handleSaveGroupMembers = async () => {
        if (!managingMembersGroup) return;
        try {
            const res = await fetch(`http://localhost:4000/api/security/groups/${managingMembersGroup.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ userIds: groupMembersIds })
            });

            if (res.ok) {
                showToast('Group members updated', 'success');
                setShowMembersModal(false);
                fetchGroups();
                fetchUsers();
            }
        } catch (error) { console.error(error); showToast('Error updating members', 'error'); }
    };

    const toggleUserInGroup = (userId: string) => {
        setGroupMembersIds(prev =>
            prev.includes(userId) ? prev.filter(id => id !== userId) : [...prev, userId]
        );
    };

    const handleCreatePermission = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch('http://localhost:4000/api/security/permissions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newPermission)
            });
            if (res.ok) {
                showToast('Permission created', 'success');
                setShowPermissionModal(false);
                fetchPermissions();
                setNewPermission({ action: '', resource: '', description: '' });
            }
        } catch (error) { console.error(error); }
    };

    const handleSeedPermissions = async () => {
        if (!confirm('Seed system permissions?')) return;
        try {
            await fetch('http://localhost:4000/api/security/seed-permissions', { method: 'POST' });
            fetchPermissions();
            showToast('System permissions seeded', 'success');
        } catch (error) { console.error(error); }
    };

    const handleDeletePermission = async (permId: string) => {
        if (!confirm('Delete permission?')) return;
        try {
            await fetch(`http://localhost:4000/api/security/permissions/${permId}`, { method: 'DELETE' });
            fetchPermissions();
            showToast('Permission deleted', 'success');
        } catch (error) { console.error(error); }
    };

    const openUserModal = (u: User) => {
        setEditingUser(u);
        setSelectedRoleForUser(u.role_id || '');
        setSelectedGroupsForUser(u.groups?.map(g => g.id) || []);
        setSelectedLocationsForUser(u.locationAccess?.map(la => la.locationId) || []);
    };

    const handleUpdateUser = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingUser) return;
        try {
            const res = await fetch(`http://localhost:4000/api/security/users/${editingUser.user_id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    role_id: selectedRoleForUser,
                    group_ids: selectedGroupsForUser,
                    location_ids: selectedLocationsForUser
                })
            });
            if (res.ok) {
                showToast('User updated', 'success');
                setEditingUser(null);
                fetchUsers();
            }
        } catch (error) { console.error(error); showToast('Error updating user', 'error'); }
    };

    const togglePermission = (id: string) => {
        setSelectedPermIds(prev =>
            prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id]
        );
    };

    const filteredUsers = users.filter(u =>
        u.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.email?.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="security-page">
            <div className="page-header">
                <div className="header-info">
                    <h1>Security Management</h1>
                    <p className="subtitle">Manage user access, roles, groups, and global security policies.</p>
                </div>
                <div className="header-actions">
                    {activeTab === 'roles' && <button className="action-btn" onClick={() => { setEditingRole(null); setRoleForm({ role_name: '', description: '' }); setSelectedPermIds([]); setShowRoleModal(true); }}><Plus size={18} /> New Role</button>}
                    {activeTab === 'groups' && <button className="action-btn" onClick={() => { setEditingGroup(null); setGroupForm({ name: '', description: '' }); setShowGroupModal(true); }}><Plus size={18} /> New Group</button>}
                    {activeTab === 'permissions' && (
                        <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="secondary-btn" onClick={handleSeedPermissions} title="Seed Default Permissions"><Activity size={18} /> Seed Defaults</button>
                            <button className="action-btn" onClick={() => setShowPermissionModal(true)} title="Add New Permission"><Plus size={18} /> New Permission</button>
                        </div>
                    )}
                </div>
            </div>

            <div className="tabs-container">
                <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}><Users size={18} /> Users</button>
                <button className={`tab-btn ${activeTab === 'roles' ? 'active' : ''}`} onClick={() => setActiveTab('roles')}><Shield size={18} /> Roles</button>
                <button className={`tab-btn ${activeTab === 'groups' ? 'active' : ''}`} onClick={() => setActiveTab('groups')}><Grid size={18} /> Groups</button>
                <button className={`tab-btn ${activeTab === 'lbac' ? 'active' : ''}`} onClick={() => setActiveTab('lbac')}><MapPin size={18} /> Locations (LBAC)</button>
                <button className={`tab-btn ${activeTab === 'permissions' ? 'active' : ''}`} onClick={() => setActiveTab('permissions')}><Key size={18} /> Permissions</button>
                <button className={`tab-btn ${activeTab === 'audit' ? 'active' : ''}`} onClick={() => setActiveTab('audit')}><Activity size={18} /> Audit Logs</button>
            </div>

            <div className="tab-content">
                {activeTab === 'users' && (
                    <div className="users-tab">
                        <div className="search-container">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search users by name or email..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <table className="security-table">
                            <thead>
                                <tr>
                                    <th>User Information</th>
                                    <th>Role</th>
                                    <th>Groups</th>
                                    <th>Location Access</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {filteredUsers.map(u => (
                                    <tr key={u.user_id}>
                                        <td>
                                            <div className="user-info">
                                                <div className="user-avatar"><UserIcon size={16} /></div>
                                                <div>
                                                    <div className="user-name">{u.full_name}</div>
                                                    <div className="user-email">{u.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td><span className="badge badge-role">{u.role?.role_name || 'No Role'}</span></td>
                                        <td>
                                            <div className="group-badges">
                                                {u.groups?.map(g => (
                                                    <span key={g.id} className="badge badge-group">{g.name}</span>
                                                ))}
                                                {u.groups?.length === 0 && <span className="text-muted">-</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <div className="location-info">
                                                {u.locationAccess?.length > 0 ? (
                                                    <span className="badge badge-lbac">{u.locationAccess.length} Locations</span>
                                                ) : <span className="badge badge-global">Global Access</span>}
                                            </div>
                                        </td>
                                        <td>
                                            <button className="icon-btn" onClick={() => openUserModal(u)} title="Edit Access"><Edit2 size={16} /></button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'roles' && (
                    <div className="roles-tab">
                        <div className="search-container">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search roles by name..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="roles-grid">
                            {roles.filter(r => r.role_name.toLowerCase().includes(searchTerm.toLowerCase())).map(role => (
                                <div key={role.role_id} className="role-card">
                                    <div className="role-header">
                                        <span className="role-name">{role.role_name}</span>
                                        <div className="role-actions">
                                            <button className="icon-btn" onClick={() => openEditRole(role)} title="Edit Role"><Edit2 size={16} /></button>
                                            <button className="icon-btn danger-hover" onClick={() => handleDeleteRole(role.role_id)} title="Delete Role"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <p className="role-description">{role.description || 'No description provided.'}</p>
                                    <div className="role-meta">
                                        <Lock size={14} style={{ marginRight: 4 }} />
                                        <span>{role.permissions?.length || 0} Permissions</span>
                                    </div>
                                    <div className="permissions-list">
                                        {role.permissions?.slice(0, 5).map(perm => (
                                            <span key={perm.id} className="permission-badge">{perm.resource}:{perm.action}</span>
                                        ))}
                                        {role.permissions?.length > 5 && (
                                            <span className="more-count">+{role.permissions.length - 5} more</span>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {activeTab === 'groups' && (
                    <div className="groups-tab">
                        <div className="search-container">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search groups..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <div className="roles-grid">
                            {groups.filter(g => g.name.toLowerCase().includes(searchTerm.toLowerCase())).map(group => (
                                <div key={group.id} className="role-card">
                                    <div className="role-header">
                                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                            <Grid size={20} className="text-muted" />
                                            <span className="role-name">{group.name}</span>
                                        </div>
                                        <div className="role-actions">
                                            <button className="icon-btn" onClick={() => openManageMembers(group)} title="Manage Members"><Users size={16} /></button>
                                            <button className="icon-btn" onClick={() => openEditGroup(group)} title="Edit Group"><Edit2 size={16} /></button>
                                            <button className="icon-btn danger-hover" onClick={() => handleDeleteGroup(group.id)} title="Delete Group"><Trash2 size={16} /></button>
                                        </div>
                                    </div>
                                    <p className="role-description">{group.description}</p>
                                    <div className="role-meta">
                                        <Users size={14} style={{ marginRight: 4 }} />
                                        <span>{group._count?.users || 0} Members</span>
                                    </div>
                                </div>
                            ))}
                            {groups.length === 0 && <div className="empty-state">No groups defined. Create one to get started.</div>}
                        </div>
                    </div>
                )}

                {activeTab === 'lbac' && (
                    <div className="lbac-tab">
                        <div className="tab-info-card">
                            <div className="info-header">
                                <MapPin size={24} color="#4f46e5" />
                                <h3>Location Based Access Control (LBAC) Matrix</h3>
                            </div>
                            <p>
                                Assign users to specific locations to restrict their data visibility.
                                Users with <b>Global Access</b> can see all records across the tenant.
                            </p>
                        </div>
                        <div className="matrix-grid">
                            {users.filter(u => u.locationAccess?.length > 0).map(u => (
                                <div key={u.user_id} className="role-card">
                                    <div className="user-info user-info-margin">
                                        <div className="user-avatar"><UserIcon size={16} /></div>
                                        <div>
                                            <div className="user-name">{u.full_name}</div>
                                            <div className="user-email">{u.email}</div>
                                        </div>
                                    </div>
                                    <div className="group-badges">
                                        {u.locationAccess.map((la: any) => (
                                            <span key={la.locationId} className="badge badge-lbac-alt">
                                                {la.location?.name || 'Loc'}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            ))}
                            {users.filter(u => u.locationAccess?.length > 0).length === 0 && (
                                <div className="empty-state">No users have location restrictions active.</div>
                            )}
                        </div>
                    </div>
                )}

                {activeTab === 'permissions' && (
                    <div className="permissions-tab">
                        <div className="search-container">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Search permissions (e.g. PROPERTY:READ)..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <table className="security-table">
                            <thead>
                                <tr>
                                    <th>Resource</th>
                                    <th>Action</th>
                                    <th>Description</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {permissions.filter(p =>
                                    `${p.resource}:${p.action}`.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(p => (
                                    <tr key={p.id}>
                                        <td style={{ fontFamily: 'monospace', fontWeight: 600 }}>{p.resource}</td>
                                        <td><span className="badge badge-group">{p.action}</span></td>
                                        <td className="text-muted">{p.description || '-'}</td>
                                        <td>
                                            <button className="icon-btn danger-hover" onClick={() => handleDeletePermission(p.id)} title="Delete Permission">
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}

                {activeTab === 'audit' && (
                    <div className="audit-tab">
                        <div className="search-container">
                            <Search className="search-icon" size={18} />
                            <input
                                type="text"
                                className="search-input"
                                placeholder="Filter logs..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                        <table className="audit-table">
                            <thead>
                                <tr>
                                    <th>Timestamp</th>
                                    <th>User</th>
                                    <th>Action</th>
                                    <th>Resource</th>
                                    <th>ID</th>
                                </tr>
                            </thead>
                            <tbody>
                                {logs.filter(log =>
                                    log.action.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    log.resource.toLowerCase().includes(searchTerm.toLowerCase()) ||
                                    log.user?.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
                                ).map(log => (
                                    <tr key={log.id}>
                                        <td style={{ color: '#6b7280', fontSize: '0.8rem' }}>
                                            {new Date(log.createdAt).toLocaleString()}
                                        </td>
                                        <td>
                                            <div className="user-name" style={{ fontSize: '0.85rem' }}>{log.user?.full_name || 'System'}</div>
                                            <div className="user-email" style={{ fontSize: '0.75rem' }}>{log.user?.email}</div>
                                        </td>
                                        <td>
                                            <span className={`audit-action ${log.action}`}>{log.action}</span>
                                        </td>
                                        <td><span className="badge badge-group" style={{ fontSize: '0.7rem' }}>{log.resource}</span></td>
                                        <td style={{ fontFamily: 'monospace', fontSize: '0.7rem', color: '#9ca3af' }}>{log.resourceId}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* User Edit Modal */}
            {editingUser && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header-flex">
                            <h3>Edit Access: {editingUser.full_name}</h3>
                            <button onClick={() => setEditingUser(null)} className="icon-btn" title="Close modal"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleUpdateUser}>
                            <div className="form-group">
                                <label>Role</label>
                                <select
                                    title="Select User Role"
                                    value={selectedRoleForUser}
                                    onChange={(e) => setSelectedRoleForUser(e.target.value)}
                                    className="search-input modal-select"
                                >
                                    <option value="">Select Role</option>
                                    {roles.map(r => <option key={r.role_id} value={r.role_id}>{r.role_name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Groups</label>
                                <select
                                    title="Select Groups"
                                    multiple
                                    value={selectedGroupsForUser}
                                    onChange={(e) => setSelectedGroupsForUser(Array.from(e.target.selectedOptions, opt => opt.value))}
                                    className="search-input modal-select-multi"
                                >
                                    {groups.map(g => <option key={g.id} value={g.id}>{g.name}</option>)}
                                </select>
                            </div>
                            <div className="form-group">
                                <label>Location Access (LBAC)</label>
                                <select
                                    title="Select Locations"
                                    multiple
                                    value={selectedLocationsForUser}
                                    onChange={(e) => setSelectedLocationsForUser(Array.from(e.target.selectedOptions, opt => opt.value))}
                                    className="search-input modal-select-multi"
                                >
                                    {locations.map(l => <option key={l.id} value={l.id}>{l.name} ({l.type || 'Loc'})</option>)}
                                </select>
                                <p className="text-muted help-text">Hold Ctrl/Cmd to select multiple.</p>
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="secondary-btn" onClick={() => setEditingUser(null)}>Cancel</button>
                                <button type="submit" className="action-btn">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* Create/Edit Role Modal */}
            {showRoleModal && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '600px' }}>
                        <div className="modal-header-flex">
                            <h3>{editingRole ? 'Update Role' : 'Create Role'}</h3>
                            <button onClick={() => setShowRoleModal(false)} className="icon-btn"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveRole}>
                            <div className="form-group">
                                <label>Role Name</label>
                                <input placeholder="e.g. Property Manager" className="search-input modal-input-padding" value={roleForm.role_name} onChange={e => setRoleForm({ ...roleForm, role_name: e.target.value })} required title="Enter role name" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea placeholder="Manage property listings and leases" className="search-input modal-textarea" value={roleForm.description} onChange={e => setRoleForm({ ...roleForm, description: e.target.value })} title="Enter role description" />
                            </div>

                            <div className="form-group">
                                <label>Assign Permissions ({selectedPermIds.length})</label>
                                <div className="permissions-scroll">
                                    {permissions.map(p => (
                                        <div key={p.id} className="permission-item">
                                            <input
                                                type="checkbox"
                                                checked={selectedPermIds.includes(p.id)}
                                                onChange={() => togglePermission(p.id)}
                                                id={`perm-${p.id}`}
                                            />
                                            <label htmlFor={`perm-${p.id}`} className="permission-label">
                                                <span className="res-name">{p.resource}:</span> {p.action}
                                            </label>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowRoleModal(false)} className="secondary-btn">Cancel</button>
                                <button type="submit" className="action-btn">{editingRole ? 'Update Role' : 'Create Role'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showGroupModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header-flex">
                            <h3>{editingGroup ? 'Update Group' : 'Create Group'}</h3>
                            <button onClick={() => setShowGroupModal(false)} className="icon-btn" title="Close group modal"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleSaveGroup}>
                            <div className="form-group">
                                <label htmlFor="group-name-input">Group Name</label>
                                <input id="group-name-input" placeholder="e.g. Sales Team" className="search-input modal-input" value={groupForm.name} onChange={e => setGroupForm({ ...groupForm, name: e.target.value })} required title="Enter group name" />
                            </div>
                            <div className="form-group">
                                <label htmlFor="group-description-textarea">Description</label>
                                <textarea id="group-description-textarea" placeholder="Regional managers for NSW" className="search-input modal-textarea" value={groupForm.description} onChange={e => setGroupForm({ ...groupForm, description: e.target.value })} title="Enter group description" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowGroupModal(false)} className="secondary-btn" title="Cancel group changes">Cancel</button>
                                <button type="submit" className="action-btn" title={editingGroup ? 'Update group' : 'Create group'}>{editingGroup ? 'Update Group' : 'Create Group'}</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showPermissionModal && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <div className="modal-header-flex">
                            <h3>Add Custom Permission</h3>
                            <button onClick={() => setShowPermissionModal(false)} className="icon-btn" title="Close modal"><X size={20} /></button>
                        </div>
                        <form onSubmit={handleCreatePermission}>
                            <div className="form-group">
                                <label>Resource</label>
                                <input placeholder="e.g. PROPERTY" className="search-input modal-input-padding" value={newPermission.resource} onChange={e => setNewPermission({ ...newPermission, resource: e.target.value })} required title="Enter resource name" />
                            </div>
                            <div className="form-group">
                                <label>Action</label>
                                <input placeholder="e.g. READ, WRITE, APPROVE" className="search-input modal-input-padding" value={newPermission.action} onChange={e => setNewPermission({ ...newPermission, action: e.target.value })} required title="Enter action name" />
                            </div>
                            <div className="form-group">
                                <label>Description</label>
                                <textarea placeholder="Ability to approve lease documents" className="search-input modal-textarea" value={newPermission.description} onChange={e => setNewPermission({ ...newPermission, description: e.target.value })} title="Enter permission description" />
                            </div>
                            <div className="modal-actions">
                                <button type="button" onClick={() => setShowPermissionModal(false)} className="secondary-btn">Cancel</button>
                                <button type="submit" className="action-btn">Create Permission</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showMembersModal && managingMembersGroup && (
                <div className="modal-overlay">
                    <div className="modal-content" style={{ maxWidth: '500px' }}>
                        <div className="modal-header-flex">
                            <h3>Manage Members: {managingMembersGroup.name}</h3>
                            <button onClick={() => setShowMembersModal(false)} className="icon-btn"><X size={20} /></button>
                        </div>
                        <div className="form-group">
                            <label>Select Group Members</label>
                            <div className="permissions-scroll" style={{ maxHeight: '400px' }}>
                                {users.map(u => (
                                    <div key={u.user_id} className="permission-item">
                                        <input
                                            type="checkbox"
                                            checked={groupMembersIds.includes(u.user_id)}
                                            onChange={() => toggleUserInGroup(u.user_id)}
                                            id={`member-${u.user_id}`}
                                        />
                                        <label htmlFor={`member-${u.user_id}`} className="permission-label">
                                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                                <span style={{ fontWeight: 600 }}>{u.full_name}</span>
                                                <span style={{ fontSize: '0.75rem', color: '#6b7280' }}>{u.email}</span>
                                            </div>
                                        </label>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="modal-actions">
                            <button type="button" className="secondary-btn" onClick={() => setShowMembersModal(false)}>Cancel</button>
                            <button type="button" className="action-btn" onClick={handleSaveGroupMembers}>Save Members</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default SecurityPage;
