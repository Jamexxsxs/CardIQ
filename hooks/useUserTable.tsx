import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import bcrypt from 'bcryptjs';

const db = SQLite.openDatabaseSync('cardIQ.db');

export function useUserTable() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createTable = async () => {
      try {
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS user (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT NOT NULL,
            email TEXT NOT NULL UNIQUE,
            password TEXT NOT NULL
          );`
        );
      } catch (err) {
        console.error('Failed to create user table:', err);
      }
    };

    createTable();
  }, []);

  const addUser = async (username: string, email: string, password: string) => {
    try {
      const result = await db.runAsync(
        'INSERT INTO user (username, email, password) VALUES (?, ?, ?);',
        [username, email, password]
      );

      return result.lastInsertRowId;
    } catch (err) {
      console.error('Add user error:', err);
    }
  };

  const authenticateUser = async (email: string, password: string) => {
    try {
      const row = await db.getFirstAsync('SELECT * FROM user WHERE email = ?;', [email]) as any;
      if (!row) return null;

      return row.password === password ? row.id : null;
    } catch (err) {
      console.error('Auth error:', err);
      return null;
    }
  };

  const getUserById = async (userId: number) => {
    try {
      const row = await db.getFirstAsync('SELECT * FROM user WHERE id = ?;', [userId]) as any;
      return row;
    } catch (err) {
      console.error('Get user error:', err);
      return null;
    }
  };

  return {
    users,
    loading,
    addUser,
    authenticateUser,
    getUserById
  };
}
