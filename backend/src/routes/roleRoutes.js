import express from 'express';
import Role from '../models/role.js';
import { logAudit } from '../utils/auditLogger.js';

const router = express.Router();

router.get('/', async (req, res) => {
  try {
    const roles = await Role.find({ tenantId: req.tenant });
    res.json(roles);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', async (req, res) => {
  try {
    const { name, slug, description, permissions } = req.body;
    const role = await Role.create({
      tenantId: req.tenant, name, slug, description, permissions
    });
    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'create',
      entityType: 'role', entityId: role._id.toString(),
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });
    res.status(201).json(role);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, tenantId: req.tenant });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.isSystem) return res.status(403).json({ message: 'Cannot modify system roles' });

    const updated = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updated);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', async (req, res) => {
  try {
    const role = await Role.findOne({ _id: req.params.id, tenantId: req.tenant });
    if (!role) return res.status(404).json({ message: 'Role not found' });
    if (role.isSystem) return res.status(403).json({ message: 'Cannot delete system roles' });

    await Role.findByIdAndDelete(req.params.id);
    await logAudit({
      tenantId: req.tenant, userId: req.user?.id, action: 'delete',
      entityType: 'role', entityId: req.params.id,
      ipAddress: req.ip, userAgent: req.headers['user-agent']
    });
    res.json({ message: 'Role deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
