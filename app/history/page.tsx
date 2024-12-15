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
  Flex 
} from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export default function HistoryDataGrid() {
  const [historys, setHistorys] = useState<Schema["History"]["type"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorys = async () => {
    try {
      const { userId } = await getCurrentUser();
      console.log("Current User ID:", userId);
  
      const { data, errors } = await client.models.History.list({
        filter: { userId: { eq: userId } }
      });
  
      console.log("Data fetched:", data, "Errors:", errors);
  
      if (errors) {
        setError("Failed to fetch history items");
        return;
      }
  
      setHistorys(data || []);
    } catch (err: any) {
      console.error("Unexpected error:", err);
      setError(err.message || "An unexpected error occurred");
    } finally {
      setLoading(false);
    }
  };
  

  useEffect(() => {
    fetchHistorys();
  }, []);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <Flex direction="column" padding="1rem">
      <h1>History</h1>
      {historys.length === 0 ? (
        <p>No history items found.</p>
      ) : (
        <Table highlightOnHover>
          <TableHead>
            <TableRow>
              <TableCell as="th">Text</TableCell>
              <TableCell as="th">Language</TableCell>
              <TableCell as="th">Status</TableCell>
              <TableCell as="th">Created At</TableCell>
              <TableCell as="th">Audio</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {historys.map((history) => (
              <TableRow key={history.id}>
                <TableCell>{history.text}</TableCell>
                <TableCell>{history.language || 'N/A'}</TableCell>
                <TableCell>{history.status || 'N/A'}</TableCell>
                <TableCell>
                  {history.createdAt 
                    ? new Date(history.createdAt).toLocaleString() 
                    : 'N/A'}
                </TableCell>
                <TableCell>
                  {history.audioUrl ? (
                    <audio 
                      controls 
                      src={history.audioUrl}
                      style={{ maxWidth: '200px' }}
                    >
                      Your browser does not support audio.
                    </audio>
                  ) : (
                    'No Audio'
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      )}
    </Flex>
  );
}