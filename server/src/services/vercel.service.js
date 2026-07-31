import axios from 'axios';

const VERCEL_API_URL = 'https://api.vercel.com';

/**
 * Deploys web app code directly to Vercel as a production deployment.
 *
 * @param {Object} params
 * @param {string} params.projectName - Vercel project name
 * @param {string} params.code - Generated HTML/CSS/JS code
 * @param {string} [params.token] - Vercel Personal Access Token
 * @returns {Promise<{ deployUrl: string, deploymentId: string }>}
 */
export const createVercelDeployment = async ({ projectName, code, token }) => {
  const vercelToken = token || process.env.VERCEL_API_TOKEN;
  if (!vercelToken) {
    throw new Error('Vercel API Token is required for deployment.');
  }

  const sanitizedName = projectName
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9-_]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '') || `echo-app-${Date.now()}`;

  const files = [
    {
      file: 'index.html',
      data: code || '<!DOCTYPE html><html><body><h1>ECHO DEV App</h1></body></html>',
    },
  ];

  try {
    const response = await axios.post(
      `${VERCEL_API_URL}/v13/deployments`,
      {
        name: sanitizedName,
        files,
        projectSettings: {
          framework: null,
        },
        target: 'production',
      },
      {
        headers: {
          Authorization: `Bearer ${vercelToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 60000,
      }
    );

    const deploymentData = response.data;
    const url = deploymentData.url ? `https://${deploymentData.url}` : deploymentData.inspectorUrl;

    return {
      deployUrl: url,
      deploymentId: deploymentData.id,
      alias: deploymentData.alias,
    };
  } catch (error) {
    if (error.response && error.response.data && error.response.data.error) {
      const errDetail = error.response.data.error.message || JSON.stringify(error.response.data.error);
      console.error('Vercel API Error:', error.response.status, errDetail);
      throw new Error(`Vercel Deployment Failed: ${errDetail}`);
    }
    console.error('Vercel API Error:', error.message);
    throw new Error(`Vercel Deployment Failed: ${error.message}`);
  }
};
