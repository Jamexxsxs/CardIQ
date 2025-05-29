import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { Alert } from 'react-native';

const db = SQLite.openDatabaseSync('cardIQ.db');

function getRandomColor(): string {
  const darkColorPalettes = [
    { r: [40, 80, 60], g: [80, 120, 100], b: [60, 80, 90] },
    { r: [150, 100, 50], g: [80, 60, 30], b: [50, 30, 20] },
    { r: [70, 40, 100], g: [60, 50, 120], b: [100, 80, 140] },
    { r: [120, 20, 60], g: [80, 25, 90], b: [70, 40, 100] },
    { r: [0, 80, 70], g: [40, 90, 50], b: [70, 110, 50] },
    { r: [140, 60, 25], g: [120, 80, 0], b: [140, 100, 5] },
    { r: [45, 55, 100], g: [25, 80, 120], b: [3, 90, 140] },
    { r: [80, 25, 90], g: [120, 20, 60], b: [140, 45, 35] },
  ]

  const palette = darkColorPalettes[Math.floor(Math.random() * darkColorPalettes.length)]

  const r = palette.r[Math.floor(Math.random() * palette.r.length)] + Math.floor(Math.random() * 15 - 7)
  const g = palette.g[Math.floor(Math.random() * palette.g.length)] + Math.floor(Math.random() * 15 - 7)
  const b = palette.b[Math.floor(Math.random() * palette.b.length)] + Math.floor(Math.random() * 15 - 7)

  // Ensure colors stay in dark range for good contrast with white text
  const clampedR = Math.max(30, Math.min(160, r))
  const clampedG = Math.max(30, Math.min(160, g))
  const clampedB = Math.max(30, Math.min(160, b))

  const toHex = (n) => n.toString(16).padStart(2, "0")

  return `#${toHex(clampedR)}${toHex(clampedG)}${toHex(clampedB)}`
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
              name TEXT NOT NULL,
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
        return rows; 
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

  const addCategory = async (name: string) => {
    const color = getRandomColor();

    try {
      const existing = await db.getAllAsync(
        'SELECT * FROM category WHERE name = ? AND user_id = ?;',
        [name, user_id]
      );

      if (existing.length > 0) {
        console.warn('Category with the same name already exists for this user.');
        Alert.alert('Duplicate Category', 'You already have a category with this name.');
        return;
      }

      await db.runAsync(
        'INSERT INTO category (name, color, user_id) VALUES (?, ?, ?);',
        [name, color, user_id]
      );
      console.log('Category added');
    } catch (err) {
      console.error('Error:', err);
    }
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

  const getTotalCategoryCount = async (): Promise<number> => {
    try {
      const rows = await db.getAllAsync('SELECT COUNT(*) as count FROM category WHERE user_id = ?;', [user_id]);
      return rows?.[0]?.count ?? 0;
    } catch (err) {
      console.error('Error getting category count:', err);
      return 0;
    }
  };

  return {
    categories,
    loading,
    getSpecificCategory,
    addCategory,
    updateCategory,
    deleteCategory,
    getTotalCategoryCount,
    refresh: fetchCategories,
  };
}
