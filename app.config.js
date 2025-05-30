import path from 'path';
import fs from 'fs';

export default ({ config }) => {
    const iconPath = path.resolve(__dirname, './assets/app-icon.png');
    const iconExists = fs.existsSync(iconPath);

    return {
        ...config,
        name: 'CardIQ',
        slug: 'CardIQ', 
        version: '1.0.0', 
        android: {
            ...config.android,
            icon: iconExists ? './assets/app-icon.png' : config.android?.icon,
            versionCode: 1 
        },
        ios: {
            ...config.ios,
            icon: iconExists ? './assets/app-icon.png' : config.ios?.icon,
            bundleIdentifier: 'com.yourcompany.CardIQ',
            buildNumber: '1', 
        },
        extra: {
            ...config.extra,
            API_KEY: process.env.API_KEY,
            PDFCO_API_KEY: process.env.PDFCO_API_KEY,
            eas: {
                projectId: "3b53a795-8b5f-4258-bbbb-f1aa875514ae"
            }
        },
        cli: {
            ...config.cli,
            appVersionSource: 'local'
        }
    };
};