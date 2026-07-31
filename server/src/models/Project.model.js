import mongoose from 'mongoose';

const projectSchema = new mongoose.Schema({
  userId: {
    type: String,
    required: true,
  },

  title: {
    type: String,
    required: true,
    default: 'Untitled Project',
  },

  description: {
    type: String,
    default: '',
  },

  messages: {
    type: Array,
    default: [],
  },

  generatedCode: {
    type: String,
    default: '',
  },

  versions: {
    type: Array,
    default: [],
  },

  githubRepo: {
    type: String,
    default: '',
  },

  deployUrl: {
    type: String,
    default: '',
  },

  deployStatus: {
    type: String,
    default: 'idle', // 'idle', 'deploying', 'deployed', 'failed'
  },

  createdAt: {
    type: Date,
    default: Date.now,
  },

  updatedAt: {
    type: Date,
    default: Date.now,
  },
});

const Project = mongoose.model('Project', projectSchema);

export default Project;