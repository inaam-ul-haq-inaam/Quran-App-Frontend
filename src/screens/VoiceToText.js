import React from 'react';
import { View, Text } from 'react-native';
import { WebView } from 'react-native-webview';

export default function VoiceToText() {
  return (
    <View style={{ flex: 1 }}>
      {/* Header */}
      <View style={{ padding: 15, backgroundColor: '#1e90ff' }}>
        <Text style={{ color: 'white', fontSize: 18 }}>
          🎤 Voice to Text Test (WebView)
        </Text>
      </View>

      {/* WebView */}
      <WebView
        originWhitelist={['*']}
        javaScriptEnabled={true}
        source={{
          html: `
<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>

<body style="font-family: Arial; padding: 20px;">

  <h3>Speak Now 🎙️</h3>

  <button onclick="startListening()" style="padding:10px;font-size:16px;">
    Start Mic
  </button>

  <p id="output" style="margin-top:20px;font-size:18px;color:green;"></p>

  <script>

    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    const recognition = new SpeechRecognition();

    recognition.lang = 'en-US'; 
    // Urdu:  'ur-PK'
    // Arabic: 'ar-SA'

    recognition.continuous = false;
    recognition.interimResults = false;

    function startListening() {
      recognition.start();
      document.getElementById("output").innerText = "Listening...";
    }

    recognition.onresult = function(event) {
      const spokenText = event.results[0][0].transcript;

      document.getElementById("output").innerText = spokenText;

      window.ReactNativeWebView.postMessage(spokenText);
    };

    recognition.onerror = function(error) {
      document.getElementById("output").innerText =
        "Error: " + error.error;
    };
  </script>

</body>
</html>
          `,
        }}
        onMessage={event => {
          console.log('VOICE TEXT FROM MIC:', event.nativeEvent.data);
        }}
      />
    </View>
  );
}
