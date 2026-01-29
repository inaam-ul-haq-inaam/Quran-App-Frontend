import VoiceCommandController from '../Service/VoiceCommandController'; // Jahan text bhejna hai

class Listener {
  constructor() {
    this.startMicCallback = null; // WebView start karne ka trigger
    this.onMicStatusChange = null; // Button ka rang badalne ka trigger
  }

  // 1. WebView yahan apne aap ko register karega
  registerWebView = callback => {
    this.startMicCallback = callback;
  };

  // 2. Button yahan register karega ta ke usay status pata chale
  registerButtonUpdates = callback => {
    this.onMicStatusChange = callback;
  };

  // 3. Button dabane par ye chalega
  startListening = () => {
    if (this.startMicCallback) {
      console.log('Service: WebView ko signal bhej raha hun...');
      this.startMicCallback(); // 🚀 WebView mein JS inject hogi
    } else {
      console.warn('Service: WebView connect nahi hai! (Check TabNav)');
    }
  };

  // 4. WebView se Data wapis aayega yahan
  handleWebViewMessage = data => {
    // console.log("Raw Message:", data);

    if (data === 'MIC_STARTED') {
      // Button ko bolo RED ho jaye
      if (this.onMicStatusChange) this.onMicStatusChange(true);
    } else if (data === 'MIC_STOPPED') {
      // Button ko bolo GREEN ho jaye
      if (this.onMicStatusChange) this.onMicStatusChange(false);
    } else if (data.startsWith('ERROR')) {
      console.error('WebView Error:', data);
      if (this.onMicStatusChange) this.onMicStatusChange(false);
    } else {
      // ✅ Asal Text aa gaya!
      console.log('User Bola:', data);

      // Agay Controller (Dimagh) ko bhejo
      VoiceCommandController.processCommand(data);
    }
  };
}

export default new Listener();
