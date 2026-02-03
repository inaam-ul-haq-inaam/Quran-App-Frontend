import PlayerService from '../Service/PlayerService';
import { ToastAndroid } from 'react-native';

class VoiceCommandController {
  // Text aayega -> Hum check karenge -> Action lenge
  processCommand(text) {
    if (!text) return;

    // 1. Chota kar lo ta ke matching asaan ho
    const command = text.toLowerCase();
    console.log('🎤 Command mili:', command);

    // --- CASE 1: PLAY ---
    if (
      command.includes('play') ||
      command.includes('chalao') ||
      command.includes('start')
    ) {
      PlayerService.play();
      ToastAndroid.show('Playing...', ToastAndroid.SHORT);
    }

    // --- CASE 2: PAUSE / STOP ---
    else if (
      command.includes('pause') ||
      command.includes('ruko') ||
      command.includes('stop')
    ) {
      PlayerService.pause();
      ToastAndroid.show('Paused', ToastAndroid.SHORT);
    }

    // --- CASE 3: NEXT ---
    else if (
      command.includes('next') ||
      command.includes('agla') ||
      command.includes('age')
    ) {
      PlayerService.next();
      ToastAndroid.show('Next Surah', ToastAndroid.SHORT);
    }

    // --- CASE 4: PREVIOUS ---
    else if (
      command.includes('previous') ||
      command.includes('pichla') ||
      command.includes('back')
    ) {
      PlayerService.previous();
      ToastAndroid.show('Previous Surah', ToastAndroid.SHORT);
    }

    // Agar kuch samajh na aaye
    else {
      console.log('❌ Command samajh nahi ayi:', command);
    }
  }
}

export default new VoiceCommandController();
