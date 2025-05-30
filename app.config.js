import path from 'path';
import fs from 'fs';

export default ({ config }) => {
    const iconPath = path.resolve(__dirname, './assets/app-icon.png');

    const iconExists = fs.existsSync(iconPath);
    return {
        ...config,
        name: 'CardIQ',
        slug: 'card-iq',
        android: {
        ...config.android,
        icon: iconExists ? './assets/app-icon.png' : config.android?.icon,
        },
        extra: {
        API_KEY: process.env.API_KEY,
        PDFCO_API_KEY: process.env.PDFCO_API_KEY
        }
    };
};
