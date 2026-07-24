import { Router } from 'express';
import {
    getRoles, createRole, updateRole, updateRolePermissions, deleteRole,
    getPermissions, createPermission, seedPermissions, deletePermission,
    getUsers, updateUser,
    getGroups, createGroup, updateGroup, deleteGroup,
    getLocations,
    getAuditLogs
} from '../controllers/security.controller';

const router = Router();

// Roles
router.get('/roles', getRoles);
router.post('/roles', createRole);
router.put('/roles/:id', updateRole);
router.put('/roles/:id/permissions', updateRolePermissions);
router.delete('/roles/:id', deleteRole);

// Permissions
router.get('/permissions', getPermissions);
router.post('/permissions', createPermission);
router.post('/seed-permissions', seedPermissions);
router.delete('/permissions/:id', deletePermission);

// Users
router.get('/users', getUsers);
router.put('/users/:id', updateUser);

// Groups
router.get('/groups', getGroups);
router.post('/groups', createGroup);
router.put('/groups/:id', updateGroup);
router.delete('/groups/:id', deleteGroup);

// Locations (LBAC)
router.get('/locations', getLocations);

// Audit Logs
router.get('/audit-logs', getAuditLogs);

export default router;
