// File Location: src/components/VoiceInputWebView.js

import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import VoiceService from '../Service/Listener'; // 👈 Ab ye file mil jayegi

const VoiceInputWebView = () => {
  const webViewRef = useRef(null);

  useEffect(() => {
    // Service ko bolo: "Main tayar hun"
    VoiceService.registerWebView(triggerMicFromJS);
  }, []);

  const triggerMicFromJS = () => {
    const jsCode = `startMic(); true;`;
    webViewRef.current?.injectJavaScript(jsCode);
  };

  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body>
      <script>
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        
        if (SpeechRecognition) {
            const recognition = new SpeechRecognition();
            recognition.lang = 'en-US'; 
            recognition.continuous = false;
            recognition.interimResults = false;

            function startMic() {
              try {
                recognition.start();
                window.ReactNativeWebView.postMessage("MIC_STARTED");
              } catch(e) {
                 // Already started logic
              }
            }

            recognition.onresult = function(event) {
              const spokenText = event.results[0][0].transcript;
              window.ReactNativeWebView.postMessage(spokenText);
            };

            recognition.onend = function() {
               window.ReactNativeWebView.postMessage("MIC_STOPPED");
            };

            recognition.onerror = function(e) {
               window.ReactNativeWebView.postMessage("ERROR: " + e.error);
            };

        } else {
           window.ReactNativeWebView.postMessage("ERROR: API Not Supported");
        }
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ height: 0, width: 0, position: 'absolute' }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent, baseUrl: 'https://google.com' }} // Security Fix
        javaScriptEnabled={true}
        domStorageEnabled={true}
        mediaPlaybackRequiresUserAction={false}
        allowsInlineMediaPlayback={true}
        onPermissionRequest={event => event.grant()} // Auto Allow
        onMessage={event => {
          VoiceService.handleWebViewMessage(event.nativeEvent.data);
        }}
      />
    </View>
  );
};

export default VoiceInputWebView;
