'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import MessagesDataGrid from "../../components/MessagesDataGrid";


Amplify.configure(outputs);
const client = generateClient<Schema>();

export default function History() {
  const [messages, setMessages] = useState<Schema["Messages"]["type"][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  function listMessages() {
    setIsLoading(true);
    client.models.Messages.observeQuery().subscribe({
      next: (data) => {
        setMessages([...data.items]);
        setIsLoading(false);
      },
      error: () => setIsLoading(false)
    });
  }

  useEffect(() => {
    listMessages();
  }, []);

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Message History</h1>
      <MessagesDataGrid 
        messages={messages} 
        isLoading={isLoading} 
      />
    </div>
  );
}