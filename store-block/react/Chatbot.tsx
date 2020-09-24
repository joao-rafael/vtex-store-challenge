//react/Chatbot.tsx
import React, { useEffect } from "react";

interface ChatbotProps {}

declare global {
  interface Window {
    kommunicate: any;
  }
}

const Chatbot: StorefrontFunctionComponent<ChatbotProps> = ({}) => {
  useEffect(() => {
    (function(_d, m) {
      var kommunicateSettings = {
        appId: "1ecb448efd574a65337a533da9dc9f9ad",
        popupWidget: true,
        automaticChatOpenOnNavigation: true,
      };
      var s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
      var h = document.getElementsByTagName("head")[0];
      h.appendChild(s);
      window.kommunicate = m;
      m._globals = kommunicateSettings;
    })(document, window.kommunicate || {});
  }, []);

  return <></>;
};

Chatbot.schema = {
  title: "chatbot",
  type: "object",
  properties: {},
};

export default Chatbot;
