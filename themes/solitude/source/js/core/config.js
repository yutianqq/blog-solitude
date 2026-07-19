const parseConfig = (id, fallback = {}) => {
  const element = document.getElementById(id);
  if (!element) return fallback;
  try {
    return JSON.parse(element.content?.textContent || element.textContent || "{}");
  } catch (error) {
    console.error(`Invalid Solitude configuration in #${id}:`, error);
    return fallback;
  }
};

export const getConfig = () => parseConfig("site-config");
export const getPageConfig = () => parseConfig("config-diff");
