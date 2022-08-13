import { ChatToken } from '../types/tokens';


export function isTranslatable(tokens: ChatToken[]): boolean {
  for (const token of tokens) {
    if (token.type === 'text') {
      return true;
    }
  }
  return false;
}


export function getLanguage(tokens: ChatToken[]): string | undefined {
  for (const token of tokens) {
    // TODO: Find a "main" language
    if (token.type === 'text' && token.language) {
      return token.language;
    }
  }
  return undefined;
}
