import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cardIQ.db');

function getRandomLightColor(): string {
    const r = Math.floor(200 + Math.random() * 55);
    const g = Math.floor(200 + Math.random() * 55);
    const b = Math.floor(200 + Math.random() * 55);
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

export function useCategoryTable(user_id: number) {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      );`
    ).then(() => fetchCategories());
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    db.getAllAsync('SELECT * FROM category WHERE user_id = ?;', [user_id])
      .then(rows => {
        setCategories(rows);
        setLoading(false);
      })
      .catch(err => console.error('Fetch error:', err));
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
    const color = getRandomLightColor();
    db.runAsync('INSERT INTO category (name, color, user_id) VALUES (?, ?);', [name, color, user_id])
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
