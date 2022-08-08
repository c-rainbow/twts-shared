import { Emote } from './emotes';
import { Pronunciation } from './pronunciations';


export type ChatTokenType =
  | 'text'
  | 'emote'
  | 'link'
  | 'mention'

  // Below two tokens are not currently used.
  | 'number'
  | 'special_characters';


export interface ChatToken {
  type: ChatTokenType; // Type of the token
  text: string; // Text of the token
  emote?: Emote; // If emote, emote detail.
  language?: string; // Language of the text, if applicable
  pronunciation?: Pronunciation; // Pronunciation of the token, if applicable
}


