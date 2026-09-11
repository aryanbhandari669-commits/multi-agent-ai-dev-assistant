import logger from '../config/logger.js';

export function parseJSONResponse(response) {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    logger.error('Error parsing JSON response:', error);
    return null;
  }
}

export function extractCodeBlocks(response) {
  const codeBlocks = [];
  const regex = /```([a-z]*)\n([\s\S]*?)```/g;
  let match;
  
  while ((match = regex.exec(response)) !== null) {
    codeBlocks.push({
      language: match[1] || 'text',
      code: match[2].trim()
    });
  }
  
  return codeBlocks;
}

export function extractLinks(response) {
  const links = [];
  const regex = /\[([^\]]+)\]\(([^)]+)\)/g;
  let match;
  
  while ((match = regex.exec(response)) !== null) {
    links.push({
      text: match[1],
      url: match[2]
    });
  }
  
  return links;
}

export function cleanResponse(response) {
  return response.trim()
    .replace(/^\*\*.*?:\*\*\s*/gm, '')
    .replace(/^\d+\.\s*/gm, '');
}

export function formatCodeResponse(language, code) {
  return `\`\`\`${language}\n${code}\n\`\`\``;
}
