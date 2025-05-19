import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cardIQ.db');

export function useTopicTable(user_id: number) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS topic (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        title TEXT NOT NULL,
        description TEXT NOT NULL,
        card_count INTEGER NOT NULL,
        added_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
        activity_datetime DATETIME,
        category_id INTEGER NOT NULL,
        FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
        user_id INTEGER NOT NULL,
        FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
      );`
    ).then(() => fetchTopics());
  }, []);

  const fetchTopics = () => {
    setLoading(true);
    db.getAllAsync('SELECT * FROM topic WHERE user_id = ?;', [user_id])
      .then(rows => {
        setTopics(rows);
        setLoading(false);
      })
      .catch(err => console.error('Fetch error:', err));
  };

  const getSpecificTopic = async (id: number) => {
    try {
      const rows = await db.getAllAsync(
        'SELECT * FROM topic WHERE id = ?;', [id]);
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('Get specific topic error:', err);
      return null;
    }
  };

  const addTopic = (title: string, description: string, card_count: number, category_id: number) => {
    db.runAsync('INSERT INTO topic (title, description, card_count, category_id, user_id) VALUES (?, ?, ?, ?, ?);', [title, description, card_count, category_id, user_id])
      .then(() => console.log('topic added'))
      .catch(err => console.error('Error:', err));
  };

  const touchTopic = (id: number) => {
    db.runAsync(
      'UPDATE topic SET activity_datetime = CURRENT_TIMESTAMP WHERE id = ?;',
      [id]
    )
      .then(fetchTopics)
      .catch(err => console.error('Touch error:', err));
  };

  const deleteTopic = (id: number) => {
    db.runAsync('DELETE FROM topic WHERE id = ?;', [id])
      .then(fetchTopics)
      .catch(err => console.error('Delete error:', err));
  };

  const fetchTopicsByCategory = (categoryId: number) => {
    setLoading(true);
    db.getAllAsync(
      `SELECT * FROM topic WHERE category_id = ?;`,
      [categoryId]
    )
      .then(rows => {
        setTopics(rows);
        setLoading(false);
      })
      .catch(err => console.error('Fetch by category error:', err));
  };

  const getRecentActivity = async (limit: number = 5) => {
    try {
      const rows = await db.getAllAsync(
        `SELECT 
           topic.category_id,
           category.name AS category_name,
           topic.title,
           topic.card_count,
           topic.activity_datetime
         FROM topic
         INNER JOIN category ON topic.category_id = category.id
         WHERE topic.activity_datetime IS NOT NULL AND topic.user_id = ?
         ORDER BY topic.activity_datetime DESC
         LIMIT ?;`,
        [user_id, limit]
      );
      return rows;
    } catch (err) {
      console.error('Get recent topics error:', err);
      return [];
    }
  };

  const getRecentlyAdded = async (limit: number = 10) => {
    try {
      const rows = await db.getAllAsync(
        `SELECT 
           topic.category_id,
           category.name AS category_name,
           topic.title,
           topic.card_count,
           topic.added_datetime
         FROM topic
         INNER JOIN category ON topic.category_id = category.id
         WHERE topic.user_id = ?
         ORDER BY topic.added_datetime DESC
         LIMIT ?;`,
        [user_id, limit]
      );
      return rows;
    } catch (err) {
      console.error('Get recently added topics error:', err);
      return [];
    }
  };

  return {
    topics,
    loading,
    getSpecificTopic,
    addTopic,
    touchTopic,
    deleteTopic,
    fetchTopicsByCategory,
    getRecentActivity,
    getRecentlyAdded,
    refresh: fetchTopics,
  };
}
