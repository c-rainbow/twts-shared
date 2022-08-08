
export interface Pronunciation {
  text: string; // Original text
  pinyin?: string; // Pinyin if the original is in Chinese language
  romaji?: string; // Romaji if the original is in Japanese language
  hanja?: string; // Hanja pronunciation if the original has Chinese characters
}
