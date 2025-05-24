import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cardIQ.db');

function getRandomColor(): string {
  const colorPalettes = [
    { r: [52, 168, 83], g: [168, 224, 144], b: [83, 144, 120] },
    { r: [255, 183, 77], g: [152, 87, 47], b: [77, 47, 30] },
    { r: [103, 58, 183], g: [123, 104, 238], b: [183, 149, 255] },
    { r: [233, 30, 99], g: [156, 39, 176], b: [103, 58, 183] }, 
    { r: [0, 150, 136], g: [76, 175, 80], b: [139, 195, 74] }, 
    { r: [255, 87, 34], g: [255, 152, 0], b: [255, 193, 7] }, 
    { r: [63, 81, 181], g: [33, 150, 243], b: [3, 169, 244] }, 
    { r: [156, 39, 176], g: [233, 30, 99], b: [244, 67, 54] }, 
  ];

  const palette = colorPalettes[Math.floor(Math.random() * colorPalettes.length)];
  
  const r = palette.r[Math.floor(Math.random() * palette.r.length)] + Math.floor(Math.random() * 30 - 15);
  const g = palette.g[Math.floor(Math.random() * palette.g.length)] + Math.floor(Math.random() * 30 - 15);
  const b = palette.b[Math.floor(Math.random() * palette.b.length)] + Math.floor(Math.random() * 30 - 15);

  const clampedR = Math.max(50, Math.min(255, r));
  const clampedG = Math.max(50, Math.min(255, g));
  const clampedB = Math.max(50, Math.min(255, b));

  const toHex = (n: number) => n.toString(16).padStart(2, '0');

  return `#${toHex(clampedR)}${toHex(clampedG)}${toHex(clampedB)}`;
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
