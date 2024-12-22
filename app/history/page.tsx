'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../amplify/data/resource";
import {
  Table,
  TableCell,
  TableBody,
  TableHead,
  TableRow,
  Card,
  Heading,
  View,
  TextAreaField,
  Button,
  Flex,
  Text,
  Alert,
} from '@aws-amplify/ui-react';
import '@aws-amplify/ui-react/styles.css';

const client = generateClient<Schema>();

export default function HistoryList() {
  const [history, setHistory] = useState<Schema["History"]["type"][]>([]);
  const [error, setError] = useState<Error | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [newHistory, setNewHistory] = useState({
    text: "",
    audioUrl: "",
    language: "english",
  });

  useEffect(() => {
    const fetchUserAndHistory = async () => {
      try {
        const { userId } = await getCurrentUser();
        setUserId(userId);

        const { data: items, errors } = await client.models.History.list({
          filter: {
            userId: { eq: userId },
          },
        });

        if (errors && errors.length > 0) {
          throw new Error(errors.map(err => err.message).join(", "));
        }

        // Sort items by createdAt in descending order (newest first)
        const sortedItems = items.sort((a, b) => 
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );

        setHistory(sortedItems);
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
      const { data: newItem, errors } = await client.models.History.create({
        text: newHistory.text,
        audioUrl: newHistory.audioUrl || null,
        language: newHistory.language || null,
        userId,
        createdAt: new Date().toISOString(),
      });
  
      if (errors && errors.length > 0) {
        throw new Error(errors.map(err => err.message).join(", "));
      }
  
      if (!newItem) {
        throw new Error("Failed to create a new history entry.");
      }
  
      // Add new item and resort the list
      setHistory((prev) => [
        newItem,
        ...prev,
      ].sort((a, b) => 
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      ));
  
      setNewHistory({
        text: "",
        audioUrl: "",
        language: "english",
      });
    } catch (err) {
      console.error("Error creating new history:", err);
      setError(err instanceof Error ? err : new Error("An unknown error occurred"));
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (error) {
    return (
      <View padding="1rem">
        <Alert variation="error">
          Error loading data: {error.message}
        </Alert>
      </View>
    );
  }

  return (
    <View padding="2rem">
      <Card>
        <Flex direction="column" gap="2rem">
          <Heading level={1}>History List</Heading>

          

          {/* History Table */}
          {history.length === 0 ? (
            <Text variation="tertiary">No history entries found.</Text>
          ) : (
            <Table
              highlightOnHover={true}
            >
              <TableHead>
                <TableRow>
                  <TableCell as="th" fontSize="large">Text</TableCell>
                  <TableCell as="th" fontSize="large">Created</TableCell>
                  <TableCell as="th" fontSize="large">Language</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {history.map(({ id, text, createdAt, language }) => (
                  <TableRow key={id}>
                    <TableCell>
                      {text.length > 100 ? `${text.substring(0, 100)}...` : text}
                    </TableCell>
                    <TableCell>{formatDate(createdAt)}</TableCell>
                    <TableCell>{language || 'english'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </Flex>
      </Card>
    </View>
  );
}