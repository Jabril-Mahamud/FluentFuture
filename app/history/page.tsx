'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function MessagesList() {
  const [messages, setMessages] = useState<Schema["Messages"]["type"][]>([]);

  function listMessages() {
    client.models.Messages.observeQuery().subscribe({
      next: (data) => setMessages([...data.items]),
    });
  }

  useEffect(() => {
    listMessages();
  }, []);

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