import { Router } from 'express';
import {
  createSnapshot,
  deleteSnapshot,
  getSnapshots,
  restoreSnapshot,
} from '../controllers/snapshot.controller.js';
import authenticate from '../middleware/auth.middleware.js';

const router = Router();

router.use(authenticate);

router.post('/:id/snapshots', createSnapshot);
router.get('/:id/snapshots', getSnapshots);
router.post('/:id/restore/:snapshotId', restoreSnapshot);
router.delete('/:id/snapshots/:snapshotId', deleteSnapshot);

export default router;
