// Listener.js

let startMicCallback = null;
let onMicStatusChange = null;

const registerWebView = callback => {
  console.log('🔗 Listener: WebView function register ho gaya!'); // Ye log aana chahiye
  startMicCallback = callback;
};

const registerButtonUpdates = callback => {
  onMicStatusChange = callback;
};

const startListening = () => {
  console.log('🚀 Service: Button Dabaya gaya...');
  if (startMicCallback) {
    console.log('🚀 Service: Triggering WebView Mic...');
    startMicCallback(); // Iske andar ka console log check karna hai
  } else {
    console.warn('⚠️ Service: startMicCallback Khali (null) hai!');
  }
};

const handleStatusUpdate = data => {
  console.log('📡 Listener Received Status:', data);
  if (data === 'MIC_STARTED') {
    if (onMicStatusChange) onMicStatusChange(true);
  } else if (data === 'MIC_STOPPED' || data.startsWith('ERROR')) {
    if (onMicStatusChange) onMicStatusChange(false);
  }
};

export default {
  registerWebView,
  registerButtonUpdates,
  startListening,
  handleWebViewMessage: handleStatusUpdate,
};
