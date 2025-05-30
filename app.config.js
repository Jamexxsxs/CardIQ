export default ({ config }) => {
  return {
    ...config,
    extra: {
      API_KEY: process.env.API_KEY,
      PDFCO_API_KEY: process.env.PDFCO_API_KEY
    }
  };
};
