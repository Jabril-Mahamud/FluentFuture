'use client';

import React, { useState, useEffect } from 'react';
import { Schema } from '../../amplify/data/resource';
import { 
  useReactTable, 
  getCoreRowModel, 
  flexRender,
  createColumnHelper 
} from '@tanstack/react-table';
import { generateClient } from 'aws-amplify/api';

export default function MessagesDataGrid() {
  const client = generateClient<Schema>();
  const [messages, setMessages] = useState<Schema['Messages']['type'][]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch messages on component mount
  useEffect(() => {
    async function fetchMessages() {
      try {
        const { data, errors } = await client.models.Messages.list({
          // Optional: add filtering or pagination
          selectionSet: ['id', 'text', 'userId', 'language', 'createdAt'],
          limit: 100
        });

        if (errors) {
          console.error('Errors fetching messages', errors);
          return;
        }

        setMessages(data);
        setIsLoading(false);
      } catch (error) {
        console.error('Error fetching messages', error);
        setIsLoading(false);
      }
    }

    fetchMessages();
  }, []);

  // Column definition
  const columnHelper = createColumnHelper<Schema['Messages']['type']>();
  const columns = [
    columnHelper.accessor('id', {
      header: 'ID',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('text', {
      header: 'Message',
      cell: info => info.getValue()
    }),
    columnHelper.accessor('language', {
      header: 'Language',
      cell: info => info.getValue() || 'N/A'
    }),
    columnHelper.accessor('createdAt', {
      header: 'Created',
      cell: info => {
        const date = info.getValue();
        return date ? new Date(date).toLocaleString() : 'N/A';
      }
    })
  ];

  // Create table instance
  const table = useReactTable({
    data: messages,
    columns,
    getCoreRowModel: getCoreRowModel()
  });

  // Render loading state
  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="spinner-border" role="status">
          <span className="sr-only">Loading...</span>
        </div>
      </div>
    );
  }

  // Render empty state
  if (messages.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-xl text-gray-600">No messages found</p>
      </div>
    );
  }

  // Render data grid
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Messages</h1>
      <div className="overflow-x-auto">
        <table className="w-full bg-white shadow-md rounded-lg overflow-hidden">
          <thead className="bg-gray-100 border-b">
            {table.getHeaderGroups().map(headerGroup => (
              <tr key={headerGroup.id}>
                {headerGroup.headers.map(header => (
                  <th 
                    key={header.id} 
                    className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                  >
                    {header.isPlaceholder
                      ? null
                      : flexRender(
                          header.column.columnDef.header,
                          header.getContext()
                        )}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody className="divide-y divide-gray-200">
            {table.getRowModel().rows.map(row => (
              <tr 
                key={row.id} 
                className="hover:bg-gray-50 transition-colors duration-200"
              >
                {row.getVisibleCells().map(cell => (
                  <td 
                    key={cell.id} 
                    className="px-4 py-3 whitespace-nowrap text-sm text-gray-900"
                  >
                    {flexRender(
                      cell.column.columnDef.cell,
                      cell.getContext()
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}