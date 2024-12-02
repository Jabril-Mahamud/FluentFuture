"use client";
import { useState, useEffect, FormEvent } from "react";
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";
import "./../app/app.css";
import { Amplify } from "aws-amplify";
import outputs from "@/amplify_outputs.json";
import "@aws-amplify/ui-react/styles.css";
import { useAuthenticator } from "@aws-amplify/ui-react";

// Configure Amplify
Amplify.configure(outputs);

export default function App() {
  // Strongly typed state
  const [todos, setTodos] = useState<Schema["Todo"]["type"][]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Get authentication context
  const { user, signOut } = useAuthenticator();

  // Client with type safety
  const client = generateClient<Schema>();

  // Fetch todos with error handling
  function listTodos() {
    setIsLoading(true);
    try {
      const subscription = client.models.Todo.observeQuery().subscribe({
        next: (data) => {
          setTodos(data.items);
          setIsLoading(false);
        },
        error: (err) => {
          console.error("Error fetching todos:", err);
          setError("Failed to fetch todos");
          setIsLoading(false);
        },
      });

      // Cleanup subscription
      return () => subscription.unsubscribe();
    } catch (err) {
      console.error("Unexpected error:", err);
      setError("An unexpected error occurred");
      setIsLoading(false);
    }
  }

  // Delete todo with error handling
  async function deleteTodo(id: string) {
    try {
      await client.models.Todo.delete({ id });
    } catch (err) {
      console.error("Error deleting todo:", err);
      setError("Failed to delete todo");
    }
  }

  // Create todo with type-safe prompt
  function createTodo(e: FormEvent) {
    e.preventDefault();
    const content = window.prompt("Enter todo content");

    if (content) {
      try {
        client.models.Todo.create({
          content: content,
        });
      } catch (err) {
        console.error("Error creating todo:", err);
        setError("Failed to create todo");
      }
    }
  }

  // Effect for initial todo fetch
  useEffect(() => {
    const cleanup = listTodos();
    return cleanup;
  }, []);

  // Render loading state
  if (isLoading) {
    return <div>Loading todos...</div>;
  }

  // Render error state
  if (error) {
    return (
      <div>
        <p>Error: {error}</p>
        <button onClick={() => setError(null)}>Retry</button>
      </div>
    );
  }

  return (
    <main>
      <h1>{user?.signInDetails?.loginId}'s Todos</h1>

      <form onSubmit={createTodo}>
        <button type="submit">+ New Todo</button>
      </form>

      <ul>
        {todos.map((todo) => (
          <li
            key={todo.id}
            onClick={() => deleteTodo(todo.id)}
            style={{ cursor: "pointer" }}
          >
            {todo.content}
          </li>
        ))}
      </ul>

      {todos.length === 0 && <p>No todos yet. Create one!</p>}

      <div>🥳 App successfully hosted. Try creating a new todo.</div>

      <button onClick={signOut}>Sign out</button>
    </main>
  );
}
