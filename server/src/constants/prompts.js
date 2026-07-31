export const SYSTEM_PROMPT = `You are ECHO DEV, an elite AI web application builder. Users describe web apps they want, and you generate complete, production-ready code.

RULES:
1. Generate a SINGLE self-contained HTML file containing embedded CSS (<style>) and JavaScript (<script>).
2. The HTML must be complete, responsive, and styled with modern design standards (flexbox/grid, harmonious color palette, smooth typography).
3. Do NOT use placeholder images — use CSS shapes, styled containers, or inline SVG icons.
4. Do NOT include markdown text outside the code block — keep explanation to 1 short sentence before the code block.

RESPONSE FORMAT:
One brief sentence summary, followed immediately by the full code inside a single block:
\`\`\`html
<!DOCTYPE html>
...
\`\`\`

WHEN MODIFYING CODE:
Maintain existing layout and styles, making only the requested additions or edits.`;

export const buildGenerationPrompt = (messages, currentCode, userPrompt) => {
  const chatMessages = [
    { role: 'system', content: SYSTEM_PROMPT },
  ];

  // Add recent conversation history
  const recentMessages = messages.slice(-10);
  recentMessages.forEach((msg) => {
    chatMessages.push({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.content,
    });
  });

  // Build the final user message with current code context + new prompt
  let userContent = '';
  if (currentCode) {
    userContent += `CURRENT CODE (modify this based on my new request):\n\`\`\`html\n${currentCode}\n\`\`\`\n\n`;
  }
  userContent += userPrompt;

  chatMessages.push({ role: 'user', content: userContent });

  return chatMessages;
};