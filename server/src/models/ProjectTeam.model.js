import mongoose from 'mongoose';

const memberSchema = new mongoose.Schema({
  email: { type: String, required: true, lowercase: true, trim: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  role: { type: String, enum: ['editor', 'viewer'], default: 'editor' },
  status: { type: String, enum: ['pending', 'accepted', 'rejected'], default: 'pending' },
}, { _id: true });

const chatMessageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  name: { type: String, required: true },
  text: { type: String, required: true, trim: true, maxlength: 2000 },
  createdAt: { type: Date, default: Date.now },
}, { _id: true });

const projectTeamSchema = new mongoose.Schema({
  projectId: { type: mongoose.Schema.Types.ObjectId, ref: 'Project', required: true, unique: true, index: true },
  owner: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  members: { type: [memberSchema], default: [] },
  chatMessages: { type: [chatMessageSchema], default: [] },
}, { timestamps: true });

projectTeamSchema.index({ 'members.email': 1, 'members.status': 1 });

export default mongoose.model('ProjectTeam', projectTeamSchema);
