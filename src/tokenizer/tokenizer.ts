import { EmoteManager, IEmoteManager } from "../emotes/manager";
import { TwitchEmoteTags } from "../types/emotes";
import { ChatToken } from "../types/tokens";
import { EmoteChecker } from '../emotes/checker';


const URL_EXPRESSION =
  /^(https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|www\.[a-zA-Z0-9][a-zA-Z0-9-]+[a-zA-Z0-9]\.[^\s]{2,}|https?:\/\/(?:www\.|(?!www))[a-zA-Z0-9]+\.[^\s]{2,}|www\.[a-zA-Z0-9]+\.[^\s]{2,})$/;

function splitIntoWords(message: string): string[] {
  const words = message
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word !== '');

  return words;
}


function isMention(word: string): boolean {
  return !!word && word.startsWith('@');
}


function isUrl(word: string): boolean {
  return !!word && URL_EXPRESSION.test(word);
}


/**
 * Add the words in the buffer to a single text token.
 * @param tokens 
 * @param buffer 
 */
function flushBuffer(tokens: ChatToken[], buffer: string[]) {
  if (buffer.length === 0) {
    return;
  }

  const text = buffer.join(' ');
  tokens.push({
    type: 'text',
    text,
  });

  buffer.length = 0;  // Javascript way to clear an array
}


export class ChatTokenizer {
  private _emoteManager: IEmoteManager;

  cosntructor(emoteManager?: IEmoteManager) {
    this._emoteManager = emoteManager || new EmoteManager();
  }

  /**
   * Tokenize a string message into tokens
   * @param channelId Numeric Twitch channel ID
   * @param message Full text message
   * @param twitchEmotes Emote IDs and ranges, as given by tmi.js
   */
  async tokenize(channelId: string, message: string, twitchEmotes: TwitchEmoteTags) {
    const buffer: string[] = [];
    const tokens: ChatToken[] = [];
    const words = splitIntoWords(message);

    /**
     * For each word, check the type of the token
     */
    const emoteChecker = new EmoteChecker(channelId, message, twitchEmotes, this._emoteManager);
    for (const word of words) {
      // 1. Check if the word is a mention of another user
      if (isMention(word)) {
        flushBuffer(tokens, buffer);
        tokens.push({
          type: 'mention',
          text: word
        });
        continue;
      }

      // 2. Check if the word is a link to a URL.
      if (isUrl(word)) {
        flushBuffer(tokens, buffer);
        tokens.push({
          type: 'link',
          text: word,
        });
        continue;
      }

      // 3. Check if the word is an emote
      const emote = await emoteChecker.checkEmote(word);
      if (emote) {
        flushBuffer(tokens, buffer);
        tokens.push({
          type: 'emote',
          text: word,
          emote,
        });
        continue;
      }

      // 4. This is a text.
      buffer.push(word);
    }

    // Lastly, flush any remaining items in the buffer
    flushBuffer(tokens, buffer);
    return tokens;
  }
}