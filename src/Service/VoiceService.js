import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import VoiceService from '../Service/Listener';

export default function VoiceToText() {
  const webViewRef = useRef(null);

  useEffect(() => {
    // Service ko batao ke main (WebView) tayar hun
    VoiceService.registerWebView(triggerMicFromJS);
  }, []);

  // Ye function Service call karega
  const triggerMicFromJS = () => {
    const jsCode = `startMic(); true;`;
    webViewRef.current?.injectJavaScript(jsCode);
  };

  // HTML + JS Code (Jo WebView mein chalega)
  const htmlContent = `
    <!DOCTYPE html>
    <html>
    <body>
      <script>
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        const recognition = new SpeechRecognition();
        
        // Settings
         recognition.lang = 'en-US'; 
    // Urdu:  'ur-PK',en-US,'ar-SA'
        recognition.continuous = false; // Auto Stop on Silence
        recognition.interimResults = false;

        function startMic() {
          try {
            recognition.start();
            window.ReactNativeWebView.postMessage("MIC_STARTED");
          } catch(e) {
            window.ReactNativeWebView.postMessage("ERROR: " + e.message);
          }
        }

        recognition.onresult = function(event) {
          const spokenText = event.results[0][0].transcript;
          // Text wapis React Native ko bhejo
          window.ReactNativeWebView.postMessage(spokenText);
        };

        recognition.onerror = function(e) {
          window.ReactNativeWebView.postMessage("ERROR: " + e.error);
        };
        
        // Jab mic khud band ho (Silence ki waja se)
        recognition.onend = function() {
           window.ReactNativeWebView.postMessage("MIC_STOPPED");
        };
      </script>
    </body>
    </html>
  `;

  return (
    <View style={{ height: 0, width: 0, overflow: 'hidden' }}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        javaScriptEnabled={true}
        onMessage={event => {
          // Message Service ko de do
          VoiceService.handleWebViewMessage(event.nativeEvent.data);
        }}
      />
    </View>
  );
}
