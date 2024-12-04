'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import { Table } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";

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
    <div className="p-4">
      <h2 className="text-2xl font-bold mb-4">Message History</h2>
      {messages.length === 0 ? (
        <p>No messages found.</p>
      ) : (
        <Table 
          highlightOnHover 
          variation="striped"
          columns={[
            { heading: 'ID', key: 'id' },
            { heading: 'Message', key: 'text' }
          ]}
          items={messages.map(msg => ({
            id: msg.id,
            text: msg.text
          }))}
        />
      )}
    </div>
  );
}