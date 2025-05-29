import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cardIQ.db');

export function useTopicTable(user_id: number) {
  const [topics, setTopics] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const createTable = async () => {
      try {
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS topic (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            title TEXT NOT NULL,
            description TEXT NOT NULL,
            card_count INTEGER NOT NULL,
            added_datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
            activity_datetime DATETIME,
            category_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            FOREIGN KEY (category_id) REFERENCES category(id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES user(id) ON DELETE CASCADE
          );`
        );
      } catch (err) {
        console.error('Failed to create topic table:', err);
      }
    };

    createTable();
  }, []);

  const fetchTopics = async () => {
    setLoading(true);
    try {
      const rows = await db.getAllAsync('SELECT * FROM topic WHERE user_id = ?;', [user_id]);
      setTopics(rows);
      return rows;  // <-- Return the fetched data here
    } catch (err) {
      console.error('Fetch error:', err);
      return [];
    } finally {
      setLoading(false);
    }
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

  const addTopic = async (
    title: string,
    description: string,
    card_count: number,
    category_id: number
  ): Promise<number> => {
    try {
      const result = await db.runAsync(
        'INSERT INTO topic (title, description, card_count, category_id, user_id) VALUES (?, ?, ?, ?, ?);',
        [title, description, card_count, category_id, user_id]
      );
      console.log('Topic added');
      return result.lastInsertRowId; 
    } catch (err) {
      console.error('Error adding topic:', err);
      throw err;
    }
  };

  const touchTopic = (id: number) => {
    db.runAsync(
      'UPDATE topic SET activity_datetime = CURRENT_TIMESTAMP WHERE id = ?;',
      [id]
    )
      .then(fetchTopics)
      .catch(err => console.error('Touch error:', err));
  };

  const deleteTopic = async (id: number) => {
    try {
      await db.runAsync("DELETE FROM topic WHERE id = ?;", [id])
      console.log("Topic deleted successfully")
    } catch (err) {
      console.error("Delete error:", err)
      throw err
    }
  }

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
           topic.id, 
           topic.category_id,
           category.name AS category_name,
           category.color,
           topic.title,
           topic.card_count,
           topic.activity_datetime
         FROM topic
         INNER JOIN category ON topic.category_id = category.id
         WHERE topic.user_id = ?
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
           topic.id, 
           topic.category_id,
           category.name AS category_name,
           category.color,
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

  const getCurrentStreak = async (): Promise<number> => {
    try {
      const rows = await db.getAllAsync(
        `SELECT DISTINCT DATE(added_datetime, '+8 hours') AS added_date
        FROM topic
        WHERE user_id = ? AND added_datetime IS NOT NULL
        ORDER BY added_date DESC;`,
        [user_id]
      );

      const addedDates = rows.map(row => row.added_date);
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      let streak = 0;

      for (let i = 0; i < addedDates.length; i++) {
        const expectedDate = new Date(today);
        expectedDate.setDate(today.getDate() - i);

        const dbDate = new Date(addedDates[i] + 'T00:00:00');

        if (dbDate.toDateString() === expectedDate.toDateString()) {
          streak++;
        } else {
          break;
        }
      }

      return streak;
    } catch (err) {
      console.error('Get current streak error:', err);
      return 0;
    }
  };

  const getTotalTopicCount = async (): Promise<number> => {
    try {
      const result = await db.getFirstAsync(
        `SELECT COUNT(*) AS count FROM topic WHERE user_id = ?;`,
        [user_id]
      );
      return result?.count ?? 0;
    } catch (err) {
      console.error("Error getting total topic count:", err);
      return 0;
    }
  };

  const getReviewedThisWeekCount = async (): Promise<number> => {
    try {
      const result = await db.getFirstAsync(
        `SELECT COUNT(DISTINCT id) AS count
        FROM topic
        WHERE user_id = ?
          AND activity_datetime IS NOT NULL
          AND DATE(activity_datetime) >= DATE('now', 'weekday 0', '-6 days');`,
        [user_id]
      );
      return result?.count ?? 0;
    } catch (err) {
      console.error("Error getting reviewed topics this week:", err);
      return 0;
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
    getCurrentStreak,
    getTotalTopicCount,
    getReviewedThisWeekCount,
    refresh: fetchTopics,
  };
}
