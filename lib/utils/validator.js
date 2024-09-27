const validateProjectName = (input) => {
    if (/^[a-zA-Z0-9-_]+$/.test(input)) return true;
    return 'Project name can only contain letters, numbers, hyphens, and underscores.';
  };
  
  const validateUrl = (input) => {
    try {
      new URL(input);
      return true;
    } catch (error) {
      return 'Please enter a valid URL.';
    }
  };
  
  module.exports = {
    validateProjectName,
    validateUrl,
  };