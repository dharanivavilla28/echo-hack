import * as snapshotService from '../services/snapshot.service.js';

const sendHandledError = (res, error) => {
  if (error.statusCode) {
    return res.status(error.statusCode).json({ success: false, message: error.message });
  }

  console.error('Snapshot Error:', error.message);
  return res.status(500).json({ success: false, message: 'Internal server error' });
};

export const createSnapshot = async (req, res) => {
  try {
    const { code, prompt, message } = req.body;
    const snapshot = await snapshotService.createSnapshot(req.params.id, req.user._id, {
      code,
      prompt,
      message,
    });

    return res.status(201).json({ success: true, snapshot });
  } catch (error) {
    return sendHandledError(res, error);
  }
};

export const getSnapshots = async (req, res) => {
  try {
    const snapshots = await snapshotService.getSnapshots(req.params.id, req.user._id);
    return res.json({ success: true, snapshots });
  } catch (error) {
    return sendHandledError(res, error);
  }
};

export const restoreSnapshot = async (req, res) => {
  try {
    const project = await snapshotService.restoreSnapshot(
      req.params.id,
      req.params.snapshotId,
      req.user._id
    );

    return res.json({ success: true, project });
  } catch (error) {
    return sendHandledError(res, error);
  }
};

export const deleteSnapshot = async (req, res) => {
  try {
    const result = await snapshotService.deleteSnapshot(req.params.id, req.params.snapshotId, req.user._id);
    return res.json({ success: true, message: result.message });
  } catch (error) {
    return sendHandledError(res, error);
  }
};
