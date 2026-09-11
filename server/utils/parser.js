export const parseJSONResponse = (response) => {
  try {
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    return null;
  } catch (error) {
    return null;
  }
};

export const extractCodeBlocks = (text) => {
  const codeBlockRegex = /```([\s\S]*?)```/g;
  const matches = [];
  let match;

  while ((match = codeBlockRegex.exec(text)) !== null) {
    matches.push({
      code: match[1].trim(),
      fullMatch: match[0]
    });
  }

  return matches;
};

export const formatAsMarkdown = (content) => {
  if (!content) return '';
  return content
    .replace(/\n/g, '\n')
    .replace(/\*\*(.+?)\*\*/g, '**$1**')
    .replace(/__(.*?)__/g, '__$1__');
};

export const extractLinksFromText = (text) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.match(urlRegex) || [];
};
