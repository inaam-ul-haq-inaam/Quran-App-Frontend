// VoiceCommandController.js

import PlayerService from '../Service/PlayerService';
import { ToastAndroid } from 'react-native';
import { BASE_URL } from '../Config/config';
import { getSurahAyats } from './Api';

class VoiceCommandController {
  // 📡 Receive voice/text command
  async processCommand(text) {
    if (!text) return;

    const cleanText = text.toLowerCase().trim();
    console.log('🎤 Sending to API:', cleanText);

    try {
      const response = await fetch(`${BASE_URL}/voice/command`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: cleanText }),
      });

      const data = await response.json();
      console.log('🤖 FULL API Response:', JSON.stringify(data));

      if (!data || !data.token) {
        ToastAndroid.show(
          '❌ Invalid response from server',
          ToastAndroid.SHORT,
        );
        return;
      }

      const action = data.token.player;
      const surahId = data.token.surah;
      const fromAyat = data.token.from;
      const toAyat = data.token.to;

      console.log(
        '👉 Extracted:',
        'Action:',
        action,
        '| Surah:',
        surahId,
        '| From:',
        fromAyat,
        '| To:',
        toAyat,
      );

      if (!action) {
        ToastAndroid.show('Command samajh nahi aya', ToastAndroid.SHORT);
        return;
      }

      await this.handleToken(action, {
        surahId,
        fromAyat,
        toAyat,
      });
    } catch (error) {
      console.log('❌ Voice API Error:', error);
      ToastAndroid.show('Server Error', ToastAndroid.SHORT);
    }
  }

  // 🔹 Execute action safely
  async handleToken(action, tokenData) {
    console.log('🎯 Inside handleToken:', action);

    switch (action.toLowerCase()) {
      case 'play':
        // 🛑 If Surah ID missing, just resume current audio
        if (!tokenData?.surahId) {
          console.log('⚠ No Surah ID provided. Resuming...');
          PlayerService.play();
          ToastAndroid.show('▶ Resuming...', ToastAndroid.SHORT);
          return;
        }

        console.log(
          '📥 Fetching Surah:',
          tokenData.surahId,
          'From:',
          tokenData.fromAyat,
          'To:',
          tokenData.toAyat,
        );

        const ayats = await getSurahAyats(
          tokenData.surahId,
          tokenData.fromAyat,
          tokenData.toAyat,
        );

        if (!ayats || ayats.length === 0) {
          console.log('❌ No ayats returned from API');
          ToastAndroid.show('Ayats not found', ToastAndroid.SHORT);
          return;
        }

        console.log('📦 Ayats received in Controller:', ayats.length);

        // ✅ Pass ONLY ayats (no second API call anywhere)
        await PlayerService.playSurah(tokenData.surahId, ayats);

        ToastAndroid.show(
          `▶ Playing Surah ${ayats[0].NameEnglish}`,
          ToastAndroid.SHORT,
        );

        break;

      case 'pause':
        PlayerService.pause();
        ToastAndroid.show('⏸ Paused', ToastAndroid.SHORT);
        break;

      case 'next':
        PlayerService.next();
        ToastAndroid.show('⏭ Next', ToastAndroid.SHORT);
        break;

      case 'previous':
        PlayerService.previous();
        ToastAndroid.show('⏮ Previous', ToastAndroid.SHORT);
        break;

      default:
        console.log('⚠ Unknown Action:', action);
        ToastAndroid.show('Unknown Command', ToastAndroid.SHORT);
    }
  }
}

export default new VoiceCommandController();
