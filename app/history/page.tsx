'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export default function HistoryList() {
  const [historys, setHistorys] = useState<Schema["History"]["type"][]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchHistorys = async () => {
    try {
      const { data, errors } = await client.models.History.list({
      });

      if (errors) {
        console.error("Errors fetching histories:", errors);
        setError("Failed to fetch history items");
      }

      if (data) {
        setHistorys(data);
      }
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
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
    <div>
      <h1>History</h1>
      {historys.length === 0 ? (
        <p>No history items found.</p>
      ) : (
        <ul>
          {historys.map(({ id, text, audioUrl }) => (
            <li key={id} className="mb-4">
              <div className="bg-gray-100 p-3 rounded">
                <h2 className="font-bold">{text}</h2>
                {audioUrl && (
                  <audio controls src={audioUrl} className="mt-2">
                    Your browser does not support the audio element.
                  </audio>
                )}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}