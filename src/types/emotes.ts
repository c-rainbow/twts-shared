
// TODO: Support unicode emotes
export type EmoteProvider = 'twitch' | 'bttv' | 'ffz' | '7tv';

export interface Emote {
  provider: EmoteProvider; // From which emote provider?
  id: string; // provider-specific unique ID
  name: string; //  name of the emote (ex: "BibleThump")
  url: string; // Default URL of the emote pic
}

export interface TwitchEmote extends Emote {
  provider: 'twitch';
}

export interface BttvEmote extends Emote {
  provider: 'bttv';
}

export interface FfzEmote extends Emote {
  provider: 'ffz';
}

export interface SevenTvEmote extends Emote {
  provider: '7tv';
}

export interface TwitchEmoteTags {
  [emoteId: string]: string[];
}
