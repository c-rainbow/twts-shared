import { Pronunciation } from "./pronunciations";
import { ChatToken } from "./tokens";


/**
 * User's translation configs
 */
export interface UserConfigs {
  defaultTargetLang: string; // Default target language
  noTransLangs?: string[]; // No-translation languages
  preferredLangs?: {
    // User preference of source language -> target language mapping
    [srcLang: string]: string;
  };
}


export interface TranslateNameRequest {
  displayName: string;
  configs: UserConfigs;
}

export interface TranslateNameResponse {
  original: string; // Original display name
  translated?: string; // Translated display name. Undefined if not translated
  srcLang: string; // Source language
  destLang: string; // Target language
  pronunciation?: Pronunciation; // Pronunciation of the display name
}


export interface TranslateChatRequest {
  tokens: ChatToken[]; // Tokens of the original chat message.
  displayName?: string; // Display name of the chatter
  configs: UserConfigs;
}

export interface TranslateChatResponse {
  original: ChatToken[]; // Tokens of the original chat message.
  translated?: ChatToken[]; // Translated chat message. Undefined if not translated
  srcLang: string; // Source language
  destLang: string; // Target language
  displayName?: TranslateNameResponse; // Translated display name, if translated
}