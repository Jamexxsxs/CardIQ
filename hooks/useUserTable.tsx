import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import bcrypt from 'bcryptjs';

const db = SQLite.openDatabaseSync('userIQ.db');

export function useUserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS user (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT NOT NULL,
        email TEXT NOT NULL,
        password TEXT NOT NULL,
      );`
    );
  }, []);

  const addUser = async (username: string, email: string, password: string) => {
    try {
      const hashedPassword = await bcrypt.hash(password, 10);
      await db.runAsync(
        'INSERT INTO user (username, email, password) VALUES (?, ?, ?);',
        [username, email, hashedPassword]
      );
    } catch (err) {
      console.error('Add user error:', err);
    }
  };

  const authenticateUser = async (email: string, password: string) => {
    try {
      const row = await db.getFirstAsync('SELECT * FROM user WHERE email = ?;', [email]) as any;
      if (!row) return null;

      const isMatch = await bcrypt.compare(password, row.password);
      return isMatch ? row.id : null;
    } catch (err) {
      console.error('Auth error:', err);
      return null;
    }
  };

  return {
    users,
    loading,
    addUser,
    authenticateUser
  };
}
