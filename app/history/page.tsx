'use client';
import { useState, useEffect } from "react";
import { generateClient } from "aws-amplify/data";
import { getCurrentUser } from "aws-amplify/auth";
import type { Schema } from "../../amplify/data/resource";

const client = generateClient<Schema>();

export default function HistoryList() {
  const [historys, setHistorys] = useState<Schema["History"]["type"][]>([]);

  const fetchHistorys = async () => {
    const { data:items, errors } = await client.models.History.list();
    setHistorys(items);
  };


  useEffect (() => {
    fetchHistorys();
  }, []);


  return(
    <div>
      <h1>History</h1>
      <ul>
        {historys.map(({ id, text, audioUrl }) => (
          <li key={id}>
            <h2>{text}</h2>
          </li>
        ))}
      </ul>
    </div>
  )

}