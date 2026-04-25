// File Location: src/components/VoiceInputWebView.js

// import React, { useEffect, useRef } from 'react';
// import { View } from 'react-native';
// import { WebView } from 'react-native-webview';
// import VoiceService from '../Service/Listener'; // 👈 Ab ye file mil jayegi

// const VoiceInputWebView = () => {
//   const webViewRef = useRef(null);

//   useEffect(() => {
//     // Service ko bolo: "Main tayar hun"
//     VoiceService.registerWebView(triggerMicFromJS);
//   }, []);

//   const triggerMicFromJS = () => {
//     const jsCode = `startMic(); true;`;
//     webViewRef.current?.injectJavaScript(jsCode);
//   };

//   const htmlContent = `
//     <!DOCTYPE html>
//     <html>
//     <head>
//       <meta name="viewport" content="width=device-width, initial-scale=1.0">
//     </head>
//     <body>
//       <script>
//         const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

//         if (SpeechRecognition) {
//             const recognition = new SpeechRecognition();
//             recognition.lang = 'en-US';
//             recognition.continuous = false;
//             recognition.interimResults = false;

//             function startMic() {
//               try {
//                 recognition.start();
//                 window.ReactNativeWebView.postMessage("MIC_STARTED");
//               } catch(e) {
//                  // Already started logic
//               }
//             }

//             recognition.onresult = function(event) {
//               const spokenText = event.results[0][0].transcript;
//               window.ReactNativeWebView.postMessage(spokenText);
//             };

//             recognition.onend = function() {
//                window.ReactNativeWebView.postMessage("MIC_STOPPED");
//             };

//             recognition.onerror = function(e) {
//                window.ReactNativeWebView.postMessage("ERROR: " + e.error);
//             };

//         } else {
//            window.ReactNativeWebView.postMessage("ERROR: API Not Supported");
//         }
//       </script>
//     </body>
//     </html>
//   `;

//   return (
//     <View style={{ height: 0, width: 0, position: 'absolute' }}>
//       <WebView
//         ref={webViewRef}
//         originWhitelist={['*']}
//         source={{ html: htmlContent, baseUrl: 'https://google.com' }} // Security Fix
//         javaScriptEnabled={true}
//         domStorageEnabled={true}
//         mediaPlaybackRequiresUserAction={false}
//         allowsInlineMediaPlayback={true}
//         onPermissionRequest={event => event.grant()} // Auto Allow
//         onMessage={event => {
//           VoiceService.handleWebViewMessage(event.nativeEvent.data);
//         }}
//       />
//     </View>
//   );
// };

// export default VoiceInputWebView;

import React, { useEffect, useRef } from 'react';
import { View } from 'react-native';
import { WebView } from 'react-native-webview';
import VoiceListener from '../Service/Listener';
import { useVoiceCommand } from '../Service/VoiceCommandController';

export default function VoiceInputWebView() {
  const webViewRef = useRef(null);
  const { processCommand } = useVoiceCommand();

  useEffect(() => {
    VoiceListener.registerWebView(() => {
      console.log('🔴 DIAGNOSTIC: Injecting JS into WebView...');
      webViewRef.current?.injectJavaScript(`startMic(); true;`);
    });
  }, []);

  const handleMessage = event => {
    const data = event.nativeEvent.data;

    // 🔍 YE LOGS ABHI CHECK KAREIN
    console.log('🔍 DIAGNOSTIC RAW DATA:', data);

    // Sakht logic: Agar data in mein se koi hai toh Listener ko jaye, warna Hook ko
    if (
      data === 'MIC_STARTED' ||
      data === 'MIC_STOPPED' ||
      data.startsWith('ERROR')
    ) {
      console.log('🎨 DIAGNOSTIC: Sending to Listener (Status)');
      VoiceListener.handleWebViewMessage(data);
    } else {
      console.log('🚀 DIAGNOSTIC: Sending to Hook (Command):', data);
      processCommand(data);
    }
  };

  const htmlContent = `
    <!DOCTYPE html><html><body><script>
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      const recognition = new SpeechRecognition();
      recognition.lang = 'en-US';
      window.startMic = () => { recognition.start(); window.ReactNativeWebView.postMessage("MIC_STARTED"); };
      recognition.onresult = (e) => { window.ReactNativeWebView.postMessage(e.results[0][0].transcript); };
      recognition.onend = () => { window.ReactNativeWebView.postMessage("MIC_STOPPED"); };
      recognition.onerror = (e) => { window.ReactNativeWebView.postMessage("ERROR: " + e.error); };
    </script></body></html>
  `;

  return (
    <View style={{ height: 0, width: 0, opacity: 0 }}>
      <WebView
        ref={webViewRef}
        source={{ html: htmlContent }}
        onMessage={handleMessage}
        javaScriptEnabled={true}
        onPermissionRequest={event => event.grant()}
      />
    </View>
  );
}
