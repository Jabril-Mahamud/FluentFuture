'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export default function MessagesList() {
  const [messages, setMessages] = useState<Schema["Messages"]["type"][]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserAndMessages = async () => {
      try {
        // Get the current authenticated user
        const { userId } = await getCurrentUser();
        setUserId(userId);

        // Fetch messages filtered by the user's ID
        const { data: items, errors } = await client.models.Messages.list({
          filter: {
            userId: { eq: userId },
          },
        });

        // Handle GraphQL errors
        if (errors && errors.length > 0) {
          throw new Error(errors.map((err) => err.message).join(", "));
        }

        setMessages(items);
      } catch (err) {
        console.error("Error fetching messages:", err);
        setError(err instanceof Error ? err : new Error("An unknown error occurred"));
      }
    };

    fetchUserAndMessages();
  }, []);

  if (error) {
    return <p>Error loading data: {error.message}</p>;
  }

  return (
    <div>
      <h1>Message History</h1>
      {messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <ul>
          {messages.map(({ id, text }) => (
            <li key={id}>{text}</li>
          ))}
        </ul>
      )}
    </div>
  );
}
