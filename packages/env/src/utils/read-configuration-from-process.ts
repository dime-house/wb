export const readConfigurationFromProcess = () => {
  return { ...process.env };
};
