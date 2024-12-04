'use client'
import React from "react";
import { FileUploader } from "@aws-amplify/ui-react-storage";

const speaker = () => {
  return (
    <div>
      <h2>Speaker</h2>

      <FileUploader
        acceptedFileTypes={["image/*"]}
        path={({ identityId }) => `protected/${identityId}/`}
        maxFileCount={1}
        isResumable
      />
    </div>
  );
};

export default speaker;
