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

  snapshots: [{
    code: {
      type: String,
      required: true,
    },
    prompt: {
      type: String,
      default: '',
    },
    message: {
      type: String,
      default: 'Auto-snapshot',
    },
    version: {
      type: Number,
      default: 0,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    restoredAt: {
      type: Date,
    },
  }],

  currentVersion: {
    type: Number,
    default: 0,
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
