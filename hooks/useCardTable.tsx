import { useEffect, useState } from 'react';
import {API_KEY} from '@env';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';

const db = SQLite.openDatabaseSync('cardIQ.db');

export function useCardTable() {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const generateCardsFromPrompt = async (
    prompt: string,
    topic_id: number,
    count: number = 5
  ) => {
    setLoading(true);
    setError(null);

    try {
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${API_KEY}`,
        {
          contents: [
            {
              parts: [
                {
                  text: `You are an assistant that generates short, concise educational flashcards in JSON format. Generate ${count} flashcards based on: "${prompt}". Make questions and answers brief. Respond as a JSON array like: [{"question":"...","answer":"..."}]`
                }
              ]
            }
          ]
        },
        {
          headers: {
            "Content-Type": "application/json"
          }
        }
      );

      const textResponse = response.data.contents[0].parts[0].text;

      const flashcards = JSON.parse(textResponse);

      flashcards.forEach(
        (card: { question: string; answer: string }, index: number) => {
          addCard(card.question, card.answer, index + 1, topic_id);
        }
      );

      fetchCardsByTopic(topic_id);
    } catch (err) {
      console.error("AI card generation error:", err);
      setError("Failed to generate cards from prompt.");
    } finally {
      setLoading(false);
    }
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
    generateCardsFromPrompt,
    fetchCardsByTopic,
    refresh: fetchCards,
  };
}
