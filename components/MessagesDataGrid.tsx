'use client';
import { 
  Table, 
  TableCell, 
  TableBody, 
  TableHead, 
  TableRow, 
  Loader
} from '@aws-amplify/ui-react';
import type { Schema } from "../amplify/data/resource";

interface MessagesDataGridProps {
  messages: Schema["Messages"]["type"][];
  isLoading: boolean;
}

export default function MessagesDataGrid({ 
  messages, 
  isLoading 
}: MessagesDataGridProps) {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loader size="large" />
      </div>
    );
  }

  return (
    <Table 
      variation="striped"
      highlightOnHover
    >
      <TableHead>
        <TableRow>
          <TableCell as="th">ID</TableCell>
          <TableCell as="th">Message</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {messages.length === 0 ? (
          <TableRow>
            <TableCell colSpan={2} className="text-center text-gray-500">
              No messages found.
            </TableCell>
          </TableRow>
        ) : (
          messages.map(({ id, text }) => (
            <TableRow key={id}>
              <TableCell>{id}</TableCell>
              <TableCell>{text}</TableCell>
            </TableRow>
          ))
        )}
      </TableBody>
    </Table>
  );
}