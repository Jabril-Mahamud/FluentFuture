'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import { 
  Table, 
  TableCell, 
  TableBody, 
  TableHead, 
  TableRow,
  Flex,
  Card,
  Heading,
  Text,
  Loader
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export default function HistoryDataGrid() {
  const [historyItems, setHistoryItems] = useState<Schema["History"]["type"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistoryItems = async () => {
    try {
      setLoading(true);
      const { userId } = await getCurrentUser();
      
      const { data, errors } = await client.models.History.list({
        filter: { userId: { eq: userId } }
      });
      
      if (errors) {
        throw new Error(errors.map(e => e.message).join(', '));
      }

      // Sort the items in memory since we can't sort in the query
      const sortedData = [...(data || [])].sort((a, b) => {
        const dateA = new Date(a.createdAt || '').getTime();
        const dateB = new Date(b.createdAt || '').getTime();
        return dateB - dateA; // Sort descending (newest first)
      });

      setHistoryItems(sortedData);
    } catch (err) {
      console.error("Error fetching history:", err);
      setError(err instanceof Error ? err.message : 'Failed to fetch history items');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistoryItems();
  }, []);

  if (loading) {
    return (
      <Flex direction="column" alignItems="center" padding="2rem">
        <Loader size="large" />
        <Text variation="secondary">Loading history...</Text>
      </Flex>
    );
  }

  return (
    <Card variation="elevated" padding="1.5rem">
      <Flex direction="column" gap="1rem">
        <Heading level={2}>Voice Generation History</Heading>
        
        {error && (
          <Text variation="error" backgroundColor="red.10" padding="1rem" borderRadius="medium">
            {error}
          </Text>
        )}

        {historyItems.length === 0 ? (
          <Text variation="secondary">
            No voice generations found. Try creating one!
          </Text>
        ) : (
          <Table highlightOnHover variation="bordered">
            <TableHead>
              <TableRow>
                <TableCell as="th" fontWeight="bold">Text Content</TableCell>
                <TableCell as="th" fontWeight="bold">Language</TableCell>
                <TableCell as="th" fontWeight="bold">Status</TableCell>
                <TableCell as="th" fontWeight="bold">Date</TableCell>
                <TableCell as="th" fontWeight="bold">Generated Audio</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {historyItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell maxWidth="300px" style={{ wordBreak: 'break-word' }}>
                    {item.text}
                  </TableCell>
                  <TableCell>{(item.language || 'en').toUpperCase()}</TableCell>
                  <TableCell>
                    <Text
                      variation={item.status === 'success' ? 'success' : 'error'}
                      fontWeight="bold"
                    >
                      {item.status ? item.status.charAt(0).toUpperCase() + item.status.slice(1) : 'N/A'}
                    </Text>
                  </TableCell>
                  <TableCell>
                    {item.createdAt ? new Date(item.createdAt).toLocaleDateString(undefined, {
                      year: 'numeric',
                      month: 'short',
                      day: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit'
                    }) : 'N/A'}
                  </TableCell>
                  <TableCell>
                    {item.audioUrl ? (
                      <audio 
                        controls 
                        src={item.audioUrl}
                        className="max-w-[200px]"
                      >
                        Your browser does not support audio playback.
                      </audio>
                    ) : (
                      <Text variation="error">No Audio Available</Text>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Flex>
    </Card>
  );
}