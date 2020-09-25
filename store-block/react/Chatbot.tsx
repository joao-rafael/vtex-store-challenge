//react/Chatbot.tsx
import React, { useEffect } from "react";

interface ChatbotProps {}

const BOT_IFRAME_ID = "kommunicate-widget-iframe";

declare global {
  interface Window {
    kommunicate: any;
    __RENDER_8_SESSION__: any;
  }
}

const Chatbot: StorefrontFunctionComponent<ChatbotProps> = ({}) => {
  function hideChatbot() {
    let botIframe = document.getElementById(BOT_IFRAME_ID) as HTMLIFrameElement;

    if (!botIframe) return;

    botIframe.style.display = "none";
  }

  async function checkAuth() {
    try {
      //@ts-ignore
      const data = await __RENDER_8_SESSION__.sessionPromise;

      if (!data.response.namespaces.authentication.storeUserId) {
        hideChatbot();
      }
    } catch (e) {
      console.error(e);
    }
  }

  checkAuth();

  setInterval(checkAuth, 3000);

  useEffect(() => {
    (function(_d, m) {
      let kommunicateSettings = {
        appId: "1ecb448efd574a65337a533da9dc9f9ad",
        popupWidget: true,
        automaticChatOpenOnNavigation: true,
      };
      let s = document.createElement("script");
      s.type = "text/javascript";
      s.async = true;
      s.src = "https://widget.kommunicate.io/v2/kommunicate.app";
      let h = document.getElementsByTagName("head")[0];
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
