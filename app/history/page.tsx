'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export default function HistoryList() {
  const [history, setHistory] = useState<Schema["History"]["type"][]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [newHistory, setNewHistory] = useState({
    text: "",
    audioUrl: "",
    language: "",
    status: "new",
  });

  useEffect(() => {
    const fetchUserAndHistory = async () => {
      try {
        // Get the current authenticated user
        const { userId } = await getCurrentUser();
        setUserId(userId);

        // Fetch history entries filtered by the user's ID
        const { data: items, errors } = await client.models.History.list({
          filter: {
            userId: { eq: userId },
          },
        });

        // Handle GraphQL errors
        if (errors && errors.length > 0) {
          throw new Error(errors.map(err => err.message).join(", "));
        }

        setHistory(items);
      } catch (err) {
        console.error("Error fetching history:", err);
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      }
    };

    fetchUserAndHistory();
  }, []);

  const handleNewHistorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newHistory.text.trim() || !userId) return;
  
    try {
      // Create a new history entry in the database
      const { data: newItem, errors } = await client.models.History.create({
        text: newHistory.text,
        audioUrl: newHistory.audioUrl || null, // Handle optional fields
        language: newHistory.language || null,
        status: newHistory.status || "new",
        userId,
        createdAt: new Date().toISOString(),
      });
  
      // Handle GraphQL errors
      if (errors && errors.length > 0) {
        throw new Error(errors.map(err => err.message).join(", "));
      }
  
      // Ensure newItem is not null
      if (!newItem) {
        throw new Error("Failed to create a new history entry.");
      }
  
      // Update the history state with the new entry
      setHistory((prev) => [
        ...prev,
        {
          ...newItem, // Spread the returned data to ensure type consistency
          id: newItem.id, // Ensure id and updatedAt are included
          updatedAt: newItem.updatedAt,
        },
      ]);
  
      setNewHistory({
        text: "",
        audioUrl: "",
        language: "",
        status: "new",
      });
    } catch (err) {
      console.error("Error creating new history:", err);
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
    }
  };

  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  return (
    <div>
      <h1>History List</h1>
      {history.length === 0 ? (
        <p>No history entries found.</p>
      ) : (
        <ul>
          {history.map(({ id, text, createdAt }) => (
            <li key={id}>
              <p><strong>Text:</strong> {text}</p>
              <p><strong>Created At:</strong> {createdAt}</p>
            </li>
          ))}
        </ul>
      )}

      <form onSubmit={handleNewHistorySubmit}>
        <h2>Add a New History Entry</h2>
        <textarea
          value={newHistory.text}
          onChange={(e) => setNewHistory({ ...newHistory, text: e.target.value })}
          placeholder="Enter text"
          rows={4}
          cols={50}
          required
        />
        <br />
        <input
          type="text"
          value={newHistory.audioUrl}
          onChange={(e) => setNewHistory({ ...newHistory, audioUrl: e.target.value })}
          placeholder="Audio URL (optional)"
        />
        <br />
        <input
          type="text"
          value={newHistory.language}
          onChange={(e) => setNewHistory({ ...newHistory, language: e.target.value })}
          placeholder="Language"
          required
        />
        <br />
        <button type="submit">Add History</button>
      </form>
    </div>
  );
}
