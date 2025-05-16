import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';

const db = SQLite.openDatabaseSync('cardIQ.db');

export function useCardTable() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    db.execAsync(
      `CREATE TABLE IF NOT EXISTS card (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        order_number INTEGER NOT NULL,
        topic_id INTEGER NOT NULL,
        FOREIGN KEY (topic_id) REFERENCES topic(id) ON DELETE CASCADE
      );`
    ).then(() => fetchCards());
  }, []);

  const fetchCards = () => {
    setLoading(true);
    db.getAllAsync('SELECT * FROM card;')
      .then(rows => {
        setCards(rows);
        setLoading(false);
      })
      .catch(err => console.error('Fetch error:', err));
  };

  const getSpecificCard = async (order_number: number, topic_id: number) => {
    try {
      const rows = await db.getAllAsync(
        'SELECT * FROM card WHERE order_number = ? AND topic_id = ?;',
        [order_number, topic_id]
      );
      return rows.length > 0 ? rows[0] : null;
    } catch (err) {
      console.error('Get specific card error:', err);
      return null;
    }
  };

  const addCard = (question: string, answer: string, order_number: number, topic_id: number) => {
    db.runAsync('INSERT INTO card (question, answer, order_number, topic_id) VALUES (?, ?, ?, ?);', [question, answer, order_number, topic_id])
        .then(() => console.log('card added'))
        .catch(err => console.error('Error:', err));
  };

  const fetchCardsByTopic = (topicId: number) => {
    setLoading(true);
    db.getAllAsync('SELECT * FROM card WHERE topic_id = ?;', [topicId])
      .then(rows => {
        setCards(rows);
        setLoading(false);
      })
      .catch(err => console.error('Fetch by topic error:', err));
  };

  return {
    cards,
    loading,
    getSpecificCard,
    addCard,
    fetchCardsByTopic,
    refresh: fetchCards,
  };
}
