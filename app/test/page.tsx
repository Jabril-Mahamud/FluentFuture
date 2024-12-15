"use client";
import type { Schema } from "@/amplify/data/resource";
import { generateClient } from "aws-amplify/api";

const client = generateClient<Schema>();

export default function TestList() {
  const createTest = async () => {
    await client.models.Test.create({
      test: "test",
    });
  };

  return (
    <div>
      <button onClick={createTest}>Create Test</button>
    </div>
  );
}
