'use client';
import React from "react";
import { FileUploader } from "@aws-amplify/ui-react-storage";
import { Amplify } from 'aws-amplify';
import { useAuthenticator } from '@aws-amplify/ui-react';
import "@aws-amplify/ui-react/styles.css";

const Speaker: React.FC = () => {
  const { user } = useAuthenticator((context) => [context.user]);

  const userUploadPath = user
  ? `private/${user.userId}/uploads` // Remove leading '/'
  : 'public/uploads'; // Remove leading '/'

  return (
    <div>
      <h2>Speaker Upload</h2>
      <FileUploader
        acceptedFileTypes={['image/*', 'application/pdf']}
        path={userUploadPath}
        maxFileCount={5}
        autoUpload={true}
        isResumable
        onUploadSuccess={(file) => {
          alert('Upload success: ' + file.key);
          console.log('File uploaded successfully:', file);
        }}
        onUploadError={(error) => {
          alert('Upload error. Please try again.');
          console.error('Upload error:', error);
        }}
      />
    </div>
  );
};

export default Speaker;