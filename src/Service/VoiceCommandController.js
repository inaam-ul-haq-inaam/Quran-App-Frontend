// src/controllers/VoiceCommandController.js

import AudioPlayerService from '../Service/PlayerService';

class VoiceCommandController {
  processCommand = text => {
    if (!text) return;

    // 1. Text ko chota (lowercase) karein ta ke matching asaan ho
    const cmd = text.toLowerCase();
    console.log('🧠 Brain Soch Raha Hai:', cmd);

    // --- A. PLAY COMMANDS ---
    if (
      cmd.includes('play') ||
      cmd.includes('chalao') ||
      cmd.includes('start') ||
      cmd.includes('shuru')
    ) {
      AudioPlayerService.play();
      return;
    }

    // --- B. PAUSE COMMANDS ---
    if (cmd.includes('pause') || cmd.includes('ruko') || cmd.includes('wait')) {
      AudioPlayerService.pause();
      return;
    }

    // --- C. STOP COMMANDS ---
    if (
      cmd.includes('stop') ||
      cmd.includes('band') ||
      cmd.includes('khatam')
    ) {
      AudioPlayerService.stop();
      return;
    }

    // --- D. NEXT COMMANDS ---
    if (
      cmd.includes('next') ||
      cmd.includes('agla') ||
      cmd.includes('age') ||
      cmd.includes('forward')
    ) {
      AudioPlayerService.next();
      return;
    }

    // --- E. PREVIOUS COMMANDS ---
    if (
      cmd.includes('previous') ||
      cmd.includes('back') ||
      cmd.includes('pichla') ||
      cmd.includes('peeche')
    ) {
      AudioPlayerService.previous();
      return;
    }

    // --- F. UNKNOWN ---
    console.log('⚠️ Command samajh nahi aayi:', cmd);
  };
}

export default new VoiceCommandController();
