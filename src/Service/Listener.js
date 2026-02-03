// File Location: src/Service/Listener.js

import VoiceCommandController from './VoiceCommandController'; // Path check kar lena

class Listener {
  constructor() {
    this.startMicCallback = null;
    this.onMicStatusChange = null;
  }

  // 1. WebView (Mic) yahan register hoga
  registerWebView = callback => {
    this.startMicCallback = callback;
  };

  // 2. Button yahan register hoga
  registerButtonUpdates = callback => {
    this.onMicStatusChange = callback;
  };

  // 3. Jab Button dabega, ye Mic ko start karega
  startListening = () => {
    if (this.startMicCallback) {
      console.log('🚀 Service: Starting Mic...');
      this.startMicCallback();
    } else {
      console.warn(
        '⚠️ Service: WebView connected nahi hai! (App.js check karein)',
      );
    }
  };

  // 4. Jab Mic se jawab ayega
  handleWebViewMessage = data => {
    // console.log("Raw:", data);

    if (data === 'MIC_STARTED') {
      if (this.onMicStatusChange) this.onMicStatusChange(true); // Button Red karo
    } else if (data === 'MIC_STOPPED') {
      if (this.onMicStatusChange) this.onMicStatusChange(false); // Button Wapis Green karo
    } else if (data.startsWith('ERROR')) {
      console.log('WebView Error:', data);
      if (this.onMicStatusChange) this.onMicStatusChange(false);
    } else {
      // ✅ Asal Command (Text)
      console.log('🗣️ User Bola:', data);
      VoiceCommandController.processCommand(data);
    }
  };
}

export default new Listener();
