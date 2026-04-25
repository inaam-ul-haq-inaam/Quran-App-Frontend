// // //VoiceService.js
// // import React, { useEffect, useRef } from 'react';
// // import { View } from 'react-native';
// // import { WebView } from 'react-native-webview';
// // import VoiceService from '../Service/Listener';

// // export default function VoiceToText() {
// //   const webViewRef = useRef(null);

// //   useEffect(() => {
// //     // Service ko batao ke main (WebView) tayar hun
// //     VoiceService.registerWebView(triggerMicFromJS);
// //   }, []);

// //   // Ye function Service call karega
// //   const triggerMicFromJS = () => {
// //     const jsCode = `startMic(); true;`;
// //     webViewRef.current?.injectJavaScript(jsCode);
// //   };

// //   // HTML + JS Code (Jo WebView mein chalega)
// //   const htmlContent = `
// //     <!DOCTYPE html>
// //     <html>
// //     <body>
// //       <script>
// //         const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
// //         const recognition = new SpeechRecognition();

// //         // Settings
// //          recognition.lang = 'en-US';
// //     // Urdu:  'ur-PK',en-US,'ar-SA'
// //         recognition.continuous = false; // Auto Stop on Silence
// //         recognition.interimResults = false;

// //         function startMic() {
// //           try {
// //             recognition.start();
// //             window.ReactNativeWebView.postMessage("MIC_STARTED");
// //           } catch(e) {
// //             window.ReactNativeWebView.postMessage("ERROR: " + e.message);
// //           }
// //         }

// //         recognition.onresult = function(event) {
// //           const spokenText = event.results[0][0].transcript;
// //           // Text wapis React Native ko bhejo
// //           window.ReactNativeWebView.postMessage(spokenText);
// //         };

// //         recognition.onerror = function(e) {
// //           window.ReactNativeWebView.postMessage("ERROR: " + e.error);
// //         };

// //         // Jab mic khud band ho (Silence ki waja se)
// //         recognition.onend = function() {
// //            window.ReactNativeWebView.postMessage("MIC_STOPPED");
// //         };
// //       </script>
// //     </body>
// //     </html>
// //   `;

// //   return (
// //     <View style={{ height: 0, width: 0, overflow: 'hidden' }}>
// //       <WebView
// //         ref={webViewRef}
// //         originWhitelist={['*']}
// //         source={{ html: htmlContent }}
// //         javaScriptEnabled={true}
// //         onMessage={event => {
// //           // Message Service ko de do
// //           VoiceService.handleWebViewMessage(event.nativeEvent.data);
// //         }}
// //       />
// //     </View>
// //   );
// // }

// // VoiceToText.js (Updated)
// // File: VoiceInputWebView.js (Jo TabNav mein VM ke naam se hai)
// import React, { useEffect, useRef } from 'react';
// import { View } from 'react-native';
// import { WebView } from 'react-native-webview';
// import VoiceListener from '../Service/Listener';
// import { useVoiceCommand } from '../Service/VoiceCommandController';

// export default function VoiceInputWebView() {
//   const webViewRef = useRef(null);
//   const { processCommand } = useVoiceCommand();

//   useEffect(() => {
//     VoiceListener.registerWebView(() => {
//       console.log('🔴 DIAGNOSTIC: Injecting JS into WebView...');
//       webViewRef.current?.injectJavaScript(`startMic(); true;`);
//     });
//   }, []);

//   const handleMessage = event => {
//     const data = event.nativeEvent.data;

//     // 🔍 YE LOGS ABHI CHECK KAREIN
//     console.log('🔍 DIAGNOSTIC RAW DATA:', data);

//     // Sakht logic: Agar data in mein se koi hai toh Listener ko jaye, warna Hook ko
//     if (
//       data === 'MIC_STARTED' ||
//       data === 'MIC_STOPPED' ||
//       data.startsWith('ERROR')
//     ) {
//       console.log('🎨 DIAGNOSTIC: Sending to Listener (Status)');
//       VoiceListener.handleWebViewMessage(data);
//     } else {
//       console.log('🚀 DIAGNOSTIC: Sending to Hook (Command):', data);
//       processCommand(data);
//     }
//   };

//   const htmlContent = `
//     <!DOCTYPE html><html><body><script>
//       const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
//       const recognition = new SpeechRecognition();
//       recognition.lang = 'en-US';
//       window.startMic = () => { recognition.start(); window.ReactNativeWebView.postMessage("MIC_STARTED"); };
//       recognition.onresult = (e) => { window.ReactNativeWebView.postMessage(e.results[0][0].transcript); };
//       recognition.onend = () => { window.ReactNativeWebView.postMessage("MIC_STOPPED"); };
//       recognition.onerror = (e) => { window.ReactNativeWebView.postMessage("ERROR: " + e.error); };
//     </script></body></html>
//   `;

//   return (
//     <View style={{ height: 0, width: 0, opacity: 0 }}>
//       <WebView
//         ref={webViewRef}
//         source={{ html: htmlContent }}
//         onMessage={handleMessage}
//         javaScriptEnabled={true}
//         onPermissionRequest={event => event.grant()}
//       />
//     </View>
//   );
// }
