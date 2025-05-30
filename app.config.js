export default ({ config }) => {
    const isPreview = process.env.ENV_NAME === 'preview';
    return {
        ...config,
        name: isPreview ? 'CardIQ' : config.name,
        slug: isPreview ? 'cardiq-preview' : config.slug,
        android: {
        ...config.android,
        icon: isPreview ? './assets/cardiq-icon.png' : config.android?.icon,
        },
        extra: {
        API_KEY: process.env.API_KEY,
        PDFCO_API_KEY: process.env.PDFCO_API_KEY
        }
    };
};
