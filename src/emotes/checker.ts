import { Emote, TwitchEmote, TwitchEmoteTags } from '../types/emotes';
import { IEmoteManager, EmoteManager } from './manager';

 
export interface IEmoteChecker {
  checkEmote(word: string): Promise<Emote | undefined>;
}


export function populateTwitchEmotesFromTags(
  message: string,
  twitchEmoteTags: TwitchEmoteTags,
): Map<string, TwitchEmote> {
  const twitchEmotes = new Map<string, TwitchEmote>(); // name to ID
  for (const [emoteId, ranges] of Object.entries(twitchEmoteTags)) {
    const splitted = ranges[0].split('-');
    const startIndex = parseInt(splitted[0]);
    const endIndex = parseInt(splitted[1]);
    const name = message.substring(startIndex, endIndex + 1);

    twitchEmotes.set(name, {
      provider: 'twitch',
      id: emoteId,
      name,
      url: `https://static-cdn.jtvnw.net/emoticons/v2/${emoteId}/default/light/1.0`,
    });
  }

  return twitchEmotes;
}


export class EmoteChecker implements IEmoteChecker {
  private _channelId: string;
  private _twitchEmotes: Map<string, TwitchEmote>;
  private _manager: IEmoteManager;

  constructor(channelId: string, message: string, emotes?: TwitchEmoteTags, manager?: IEmoteManager) {
    this._channelId = channelId;
    this._twitchEmotes = populateTwitchEmotesFromTags(message, emotes || {});
    this._manager = manager || new EmoteManager();
  }

  async checkEmote(word: string): Promise<Emote | undefined> {
    const twitchEmote = this._twitchEmotes.get(word);
    if (twitchEmote) {
      return twitchEmote;
    }

    return this._manager.getEmote(this._channelId, word);
  }
}