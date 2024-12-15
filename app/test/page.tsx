"use client";
import { useState, useEffect } from 'react';
import { generateClient } from "aws-amplify/data";
import type { Schema } from "@/amplify/data/resource";

const client = generateClient<Schema>();

export default function TestManagement() {
  const [tests, setTests] = useState<Schema['Test'][]>([]);
  const [newTestText, setNewTestText] = useState('');
  const [editingTest, setEditingTest] = useState<Schema['Test'] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch all tests
  const fetchTests = async () => {
    setIsLoading(true);
    try {
      const { data, errors } = await client.models.Test.list();
      
      if (errors) {
        setError('Failed to fetch tests');
        console.error(errors);
      } else {
        setTests(data);
      }
    } catch (err) {
      setError('Error fetching tests');
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  // Create a new test
  const createTest = async () => {
    if (!newTestText.trim()) {
      setError('Test text cannot be empty');
      return;
    }

    try {
      await client.models.Test.create({
        text: newTestText
      });
      setNewTestText('');
      await fetchTests();
    } catch (err) {
      setError('Failed to create test');
      console.error(err);
    }
  };

  // Update an existing test
  const updateTest = async () => {
    if (!editingTest) return;

    try {
      await client.models.Test.update({
        id: editingTest.id,
        text: editingTest.text
      });
      setEditingTest(null);
      await fetchTests();
    } catch (err) {
      setError('Failed to update test');
      console.error(err);
    }
  };

  // Delete a test
  const deleteTest = async (id: string) => {
    try {
      await client.models.Test.delete({ id });
      await fetchTests();
    } catch (err) {
      setError('Failed to delete test');
      console.error(err);
    }
  };

  // Fetch tests on component mount
  useEffect(() => {
    fetchTests();
  }, []);

  return (
    <div className="max-w-2xl mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Test Management</h1>

      {/* Create/Edit Test Input */}
      <div className="flex mb-4">
        <input
          type="text"
          value={editingTest ? editingTest.text : newTestText}
          onChange={(e) => 
            editingTest 
              ? setEditingTest({...editingTest, text: e.target.value}) 
              : setNewTestText(e.target.value)
          }
          placeholder="Enter test text"
          className="flex-grow p-2 border rounded-l"
        />
        {editingTest ? (
          <>
            <button 
              onClick={updateTest}
              className="bg-green-500 text-white px-4 py-2"
            >
              Update
            </button>
            <button 
              onClick={() => setEditingTest(null)}
              className="bg-gray-500 text-white px-4 py-2"
            >
              Cancel
            </button>
          </>
        ) : (
          <button 
            onClick={createTest}
            className="bg-blue-500 text-white px-4 py-2 rounded-r"
          >
            Create
          </button>
        )}
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          {error}
          <button 
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-2"
          >
            ×
          </button>
        </div>
      )}

      {/* Loading State */}
      {isLoading ? (
        <p className="text-center">Loading tests...</p>
      ) : (
        // Test List
        <div>
          <h2 className="text-xl font-semibold mb-2">Tests</h2>
          {tests.length === 0 ? (
            <p className="text-gray-500">No tests found</p>
          ) : (
            <ul className="space-y-2">
              {tests.map((test) => (
                <li 
                  key={test.id} 
                  className="flex justify-between items-center p-2 border rounded bg-gray-100"
                >
                  <span>{test.text}</span>
                  <div className="space-x-2">
                    <button 
                      onClick={() => setEditingTest(test)}
                      className="bg-yellow-500 text-white px-2 py-1 rounded"
                    >
                      Edit
                    </button>
                    <button 
                      onClick={() => deleteTest(test.id)}
                      className="bg-red-500 text-white px-2 py-1 rounded"
                    >
                      Delete
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}