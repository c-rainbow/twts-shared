
import { Emote } from '../types/emotes';
import { EmoteFetcher } from './fetcher';


export class EmoteManager {
  private _fetcher: EmoteFetcher;

  // For now, use one repository for all sources of emotes. This design decision may change later.
  private _globalEmotes: Map<string, Emote>; // emote name to emote object.
  private _channelEmotes: Map<string, Map<string, Emote>>; // Numeric channel ID to emotes

  constructor(fetcher: EmoteFetcher) {
    if (fetcher) {
      this._fetcher = fetcher;
    }
    else {
      this._fetcher = new EmoteFetcher();
    }
    this._globalEmotes = new Map<string, Emote>();
    this._channelEmotes = new Map<string, Map<string, Emote>>();

    // Eagerly preload global emotes because it can take a few seconds.
    this._populateGlobalEmotes();
  }

  async getEmote(channelId: string, word: string): Promise<Emote | undefined> {
    // First, check if the wors is a global emote.
    const globalEmote = this._globalEmotes.get(word);
    if (globalEmote) {
      return globalEmote;
    }

    // Next, check for the channel emotes from various sources
    if (!this._isPopulated(channelId)) {
      await this._populateEmotes(channelId);
    }
    return this._channelEmotes.get(channelId)?.get(word);
  }

  /**
   * Populate global emotes. This is supposed to be called in constructor.
   */
  private _populateGlobalEmotes() {
    const bttvPromise = this._fetcher.fetchBttvGlobalEmotes();
    const ffzPromise = this._fetcher.fetchFfzGlobalEmotes();
    const sevenTvPromise = this._fetcher.fetch7tvGlobalEmotes();

    Promise.allSettled([bttvPromise, ffzPromise, sevenTvPromise]).then(results => {
      results.forEach(result => {
        if (result.status === 'fulfilled') {
          result.value.forEach(emote => this._globalEmotes.set(emote.name, emote));
        }
      });
    });
  }

  private async _populateEmotes(channelId: string) {
    if (this._isPopulated(channelId)) {
      return;
    }
    const emoteMap = new Map<string, Emote>();
    this._channelEmotes.set(channelId, emoteMap);

    const bttvPromise = this._fetcher.fetchBttvEmotes(channelId);
    const ffzPromise = this._fetcher.fetchFfzEmotes(channelId);
    const sevenTvPromise = this._fetcher.fetch7tvEmotes(channelId);

    const results = await Promise.allSettled([
      bttvPromise, ffzPromise, sevenTvPromise
    ]);

    results.forEach(result => {
      if (result.status === 'fulfilled') {
        result.value.forEach((emote) => {
          emoteMap.set(emote.name, emote);
        });
      }
    });
  }

  private _isPopulated(channelId: string): boolean {
    // TODO: add expiration time
    return this._channelEmotes.has(channelId);
  }
}
