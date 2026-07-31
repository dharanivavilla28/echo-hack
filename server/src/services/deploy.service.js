import Project from '../models/Project.model.js';
import { createRepoAndPushCode } from './github.service.js';
import { createVercelDeployment } from './vercel.service.js';

/**
 * Orchestrates deployment flow to GitHub and Vercel.
 *
 * @param {string} projectId
 * @param {string} userId
 * @param {Object} options
 * @param {string} options.repoName
 * @param {string} [options.githubToken]
 * @param {string} [options.vercelToken]
 * @returns {Promise<Object>}
 */
export const executeDeployment = async (projectId, userId, { repoName, githubToken, vercelToken }) => {
  const project = await Project.findOne({ _id: projectId, userId });
  if (!project) {
    const error = new Error('Project not found or unauthorized.');
    error.statusCode = 404;
    throw error;
  }

  if (!project.generatedCode) {
    const error = new Error('No generated code found to deploy. Please generate code first.');
    error.statusCode = 400;
    throw error;
  }

  project.deployStatus = 'deploying';
  await project.save();

  let githubResult = null;
  let vercelResult = null;

  try {
    const desiredName = repoName || project.title || 'echo-dev-app';

    // 1. Create GitHub Repository & Push Code (if githubToken or GITHUB_TOKEN is available)
    const effectiveGithubToken = githubToken || process.env.GITHUB_TOKEN;
    if (effectiveGithubToken) {
      console.log('Pushing code to GitHub repository...');
      githubResult = await createRepoAndPushCode({
        repoName: desiredName,
        code: project.generatedCode,
        token: effectiveGithubToken,
      });
      project.githubRepo = githubResult.repoUrl;
    }

    // 2. Deploy to Vercel (if vercelToken or VERCEL_API_TOKEN is available)
    const effectiveVercelToken = vercelToken || process.env.VERCEL_API_TOKEN;
    if (effectiveVercelToken) {
      console.log('Deploying to Vercel...');
      vercelResult = await createVercelDeployment({
        projectName: desiredName,
        code: project.generatedCode,
        token: effectiveVercelToken,
      });
      project.deployUrl = vercelResult.deployUrl;
    }

    if (!githubResult && !vercelResult) {
      throw new Error('Please provide a GitHub Token or Vercel Token to complete deployment.');
    }

    project.deployStatus = 'deployed';
    project.updatedAt = new Date();
    await project.save();

    return {
      success: true,
      githubRepo: project.githubRepo,
      deployUrl: project.deployUrl,
      deployStatus: project.deployStatus,
      updatedAt: project.updatedAt,
    };
  } catch (err) {
    project.deployStatus = 'failed';
    await project.save();
    throw err;
  }
};
