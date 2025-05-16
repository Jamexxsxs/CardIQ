import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cardIQ.db');

function getRandomLightColor(): string {
    const r = Math.floor(200 + Math.random() * 55);
    const g = Math.floor(200 + Math.random() * 55);
    const b = Math.floor(200 + Math.random() * 55);
    return `#${r.toString(16)}${g.toString(16)}${b.toString(16)}`;
}

export function useCategory() {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        color TEXT NOT NULL
      );`
    ).then(() => fetchCategories());
  }, []);

  const fetchCategories = () => {
    setLoading(true);
    db.getAllAsync('SELECT * FROM category;')
      .then(rows => {
        setCategories(rows);
        setLoading(false);
      })
      .catch(err => console.error('Fetch error:', err));
  };

  const addCategory = (name: string) => {
    const color = getRandomLightColor();
    db.runAsync('INSERT INTO category (name, color) VALUES (?, ?);', [name, color])
      .then(() => console.log('Category added'))
      .catch(err => console.error('Error:', err));
  };

  const updateCategory = (id: number, name: string) => {
    db.runAsync('UPDATE categories SET name = ? WHERE id = ?;', [name, id])
      .then(fetchCategories)
      .catch(err => console.error('Update error:', err));
  };

  const deleteCategory = (id: number) => {
    db.runAsync('DELETE FROM categories WHERE id = ?;', [id])
      .then(fetchCategories)
      .catch(err => console.error('Delete error:', err));
  };

  return {
    categories,
    loading,
    addCategory,
    updateCategory,
    deleteCategory,
    refresh: fetchCategories,
  };
}
