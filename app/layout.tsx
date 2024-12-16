"use client";

import React from "react";
import { Amplify } from "aws-amplify";
import "./app.css";

import { Authenticator, Theme, ThemeProvider } from "@aws-amplify/ui-react";
import "@aws-amplify/ui-react/styles.css";
import outputs from "@/amplify_outputs.json";

Amplify.configure(outputs);


const theme: Theme = {
  name: 'my-theme',
  tokens: {
    colors: {
      font: {
        primary: { value: '#008080' },
        // ...
      },
    },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <ThemeProvider>
          <Authenticator signUpAttributes={["birthdate"]}>
            {children}
          </Authenticator>
        </ThemeProvider>
      </body>
    </html>
  );
}
