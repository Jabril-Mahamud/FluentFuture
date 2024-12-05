'use client'
import React from "react";
import { FileUploader } from "@aws-amplify/ui-react-storage";
import { Amplify } from 'aws-amplify';


const Speaker: React.FC = () => {
  return (
    <div>
      <h2>Speaker</h2>
      <FileUploader
        acceptedFileTypes={['image/*']}
        path="public/"
        maxFileCount={100}
        isResumable
      />
    </div>
  );
};

export default Speaker;