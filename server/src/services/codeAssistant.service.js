import { askGrok } from './grok.service.js';

/**
 * Answers questions about project code using the AI service.
 *
 * @param {string} question - User question
 * @param {Array<{path: string, content: string}>} projectFiles - Array of project files
 * @returns {Promise<{ answer: string }>}
 */
export const askCodeAssistant = async (question, projectFiles = []) => {
  if (!question || !question.trim()) {
    throw new Error('Question is required.');
  }

  // Performance optimization: format and truncate files over 1500 lines
  let filesSection = '';
  if (Array.isArray(projectFiles) && projectFiles.length > 0) {
    filesSection = projectFiles
      .map((file) => {
        const filePath = file.path || file.name || 'index.html';
        let content = file.content || '';
        
        const lines = content.split('\n');
        if (lines.length > 1500) {
          content = lines.slice(0, 1500).join('\n') + '\n\n...[file truncated after 1500 lines]...';
        }

        return `--- File: ${filePath} ---\n${content}`;
      })
      .join('\n\n');
  }

  const systemInstructions = `You are an expert MERN full-stack developer and AI code assistant for ECHO DEV.
You are helping users understand, debug, explain, and navigate their project code.

Rules:
1. Always reference specific filenames, components, HTML elements, or CSS classes when explaining.
2. Explain clearly, concisely, and accurately.
3. Provide code examples in markdown code blocks (\`\`\`js, \`\`\`html, \`\`\`css, etc.) when relevant.
4. If you are unsure or the information is not in the project files, say so honestly.

Project Files:
${filesSection || 'No project files loaded yet.'}`;

  const messages = [
    { role: 'system', content: systemInstructions },
    { role: 'user', content: question.trim() },
  ];

  const answer = await askGrok(messages);

  return {
    answer,
  };
};
