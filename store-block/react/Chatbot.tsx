//react/Chatbot.tsx
import React from "react";

interface ChatbotProps {}

declare global {
  interface Window {
    kommunicate: any;
  }
}

const Chatbot: StorefrontFunctionComponent<ChatbotProps> = ({}) => {
  return <iframe src="./lex-ui/index.html" />;
};

Chatbot.schema = {
  title: "chatbot",
  type: "object",
  properties: {},
};

export default Chatbot;
