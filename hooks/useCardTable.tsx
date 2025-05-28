import { useEffect, useState } from 'react';
import {API_KEY} from '@env';
import * as SQLite from 'expo-sqlite';
import axios from 'axios';
import { useTopicTable } from './useTopicTable';

const db = SQLite.openDatabaseSync('cardIQ.db');

export function useCardTable(user_id: number) {
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const {addTopic} = useTopicTable(user_id)

  useEffect(() => {
    const createTable = async () => {
      try {
        await db.execAsync(
          `CREATE TABLE IF NOT EXISTS card (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            question TEXT NOT NULL,
            answer TEXT NOT NULL,
            order_number INTEGER NOT NULL,
            topic_id INTEGER NOT NULL,
            FOREIGN KEY (topic_id) REFERENCES topic(id) ON DELETE CASCADE
          );`
        );
      } catch (err) {
        console.error('Failed to create user table:', err);
      }
    };

    createTable();
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
    category_id: number,
    count: number = 5
  ): Promise<{ topic_id: any, title: string; description: string } | null> => {
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
                  text: `You are an assistant that generates short, concise educational flashcards in JSON format. 
  Generate a title and a short description for the topic: "${prompt}".
  Then generate ${count} flashcards based on it with these specific requirements:
  1. Each question should be longer than its corresponding answer
  2. Answers must be very concise (maximum 5 words)
  3. Questions should be complete sentences
  4. Respond with ONLY the JSON object, without any additional text or markdown
  5. The response must start with exactly "{" 

  Respond with a JSON object like:
  {
    "title": "Your title here",
    "description": "A brief description here.",
    "flashcards": [
      {"question": "A longer question...", "answer": "short answer"},
      ...
    ]
  }`
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

      let textResponse = response.data.candidates[0].content.parts[0].text;
      textResponse = textResponse.replace(/```json|```/g, '').trim();
      const parsed = JSON.parse(textResponse);

      const { title, description, flashcards } = parsed;

      const topic_id = await addTopic(title, description, flashcards.length, category_id);
      console.log(`✅ Topic created (ID: ${topic_id}):`, { title, description });

      flashcards.forEach((card: { question: string; answer: string }, index: number) => {
        addCard(card.question, card.answer, index + 1, topic_id);
        console.log(`📘 Card ${index + 1}:`, card);
      });

      fetchCardsByTopic(topic_id);

      return { topic_id, title, description };
    } catch (err) {
      console.error("AI card generation error:", err);
      setError("Failed to generate cards from prompt.");
      return null;
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
