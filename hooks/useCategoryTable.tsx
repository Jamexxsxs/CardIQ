import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cardIQ.db');

function getRandomColor(): string {
  const r = Math.floor(100 + Math.random() * 155);
  const g = Math.floor(100 + Math.random() * 155);
  const b = Math.floor(100 + Math.random() * 155);

  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
}

export function useCategoryTable(user_id: number) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
      const createTable = async () => {
        try {
          await db.execAsync(
            `CREATE TABLE IF NOT EXISTS category (
              id INTEGER PRIMARY KEY AUTOINCREMENT,
              name TEXT NOT NULL UNIQUE,
              color TEXT NOT NULL,
              user_id INTEGER NOT NULL,
              FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
            );`
          );
        } catch (err) {
          console.error('Failed to create user table:', err);
        }
      };
  
      createTable();
    }, []);

  const fetchCategories = () => {
    setLoading(true);
    return db.getAllAsync('SELECT * FROM category WHERE user_id = ?;', [user_id])
      .then(rows => {
        setCategories(rows);
        setLoading(false);
        return rows;  // Return the data here
      })
      .catch(err => {
        setLoading(false);
        console.error('Fetch error:', err);
        throw err;
      });
};

  const getSpecificCategory = async (id: number) => {
    try {
      const rows = await db.getAllAsync(
        'SELECT * FROM category WHERE id = ?', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('Get category by ID error:', err);
      return null;
    }
  };

  const addCategory = (name: string) => {
    const color = getRandomColor();
    db.runAsync('INSERT INTO category (name, color, user_id) VALUES (?, ?, ?);', [name, color, user_id])
      .then(() => console.log('Category added'))
      .catch(err => console.error('Error:', err));
  };

  const updateCategory = (id: number, name: string) => {
    db.runAsync('UPDATE category SET name = ? WHERE id = ?;', [name, id])
      .then(fetchCategories)
      .catch(err => console.error('Update error:', err));
  };

  const deleteCategory = (id: number) => {
    db.runAsync('DELETE FROM category WHERE id = ?;', [id])
      .then(fetchCategories)
      .catch(err => console.error('Delete error:', err));
  };

  return {
    categories,
    loading,
    getSpecificCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories,
  };
}
