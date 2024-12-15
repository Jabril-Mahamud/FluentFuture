'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export default function HistoryList() {
  const [history, setHistorys] = useState<Schema["History"]["type"][]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndHistorys = async () => {
      try {
        // Get the current authenticated user
        const { userId } = await getCurrentUser();
        setUserId(userId);

        // Fetch Historys filtered by the user's ID
        const { data: items, errors } = await client.models.History.list({
          filter: {
            userId: { eq: userId }
          }
        });

        // Handle GraphQL errors
        if (errors && errors.length > 0) {
          throw new Error(errors.map(err => err.message).join(', '));
        }

        setHistorys(items);
      } catch (err) {
        console.error("Error fetching Historys:", err);
        setError(err instanceof Error ? err : new Error('An unknown error occurred'));
      }
    };

    fetchUserAndHistorys();
  }, []);

  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  return (
    <div>
      <h1>Message History</h1>
      {history.length === 0 ? (
        <p>No Historys found.</p>
      ) : (
        <ul>
          {history.map(({ id, text }) => (
            <li key={id}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}