import * as FileSystem from 'expo-file-system';

const dbName = 'cardIQ.db';
const dbPath = `${FileSystem.documentDirectory}SQLite/${dbName}`;

export const resetDatabase = async () => {
  try {
    const dbExists = await FileSystem.getInfoAsync(dbPath);
    if (dbExists.exists) {
      await FileSystem.deleteAsync(dbPath, { idempotent: true });
      console.log('Database reset successful.');
    } else {
      console.log('Database file not found.');
    }
  } catch (error) {
    console.error('Failed to reset database:', error);
  }
};