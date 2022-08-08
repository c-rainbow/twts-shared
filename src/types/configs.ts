import { Pronunciation } from "./pronunciations";
import { ChatToken } from "./tokens";


export interface UserConfigs {
  defaultTargetLang: string; // Default target language
  noTransLangs?: string[]; // No-translation languages
  preferredLangs?: {
    // User preference of source language -> target language mapping
    [srcLang: string]: string;
  };
}


export interface NameTranslationResponse {
  original: string; // Original display name
  translated?: string; // Translated display name. Undefined if not translated
  srcLang: string; // Source language
  destLang: string; // Target language
  pronunciation?: Pronunciation; // Pronunciation of the display name
}


export interface ChatTranslationResponse {
  original: ChatToken[]; // Tokens of the original chat message.
  translated?: ChatToken[]; // Translated chat message. Undefined if not translated
  srcLang: string; // Source language
  destLang: string; // Target language
  displayName?: NameTranslationResponse; // Translated display name, if translated
}