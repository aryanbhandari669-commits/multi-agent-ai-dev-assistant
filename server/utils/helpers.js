export const generateId = () => {
  return `${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const generateConversationId = () => {
  return `conv_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
};

export const delay = (ms) => {
  return new Promise((resolve) => setTimeout(resolve, ms));
};

export const truncate = (str, length) => {
  return str.length > length ? str.substring(0, length) + '...' : str;
};

export const formatError = (error) => {
  return {
    message: error.message,
    status: error.status || 500,
    code: error.code
  };
};

export const parseJSON = (str) => {
  try {
    return JSON.parse(str);
  } catch (e) {
    return null;
  }
};
