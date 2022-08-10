import axios, { AxiosInstance } from 'axios';
import { BttvEmote, FfzEmote, SevenTvEmote } from '../types/emotes';


export interface IEmoteFetcher {
  fetchBttvGlobalEmotes(): Promise<BttvEmote[]>;
  fetchBttvEmotes(channelId: string): Promise<BttvEmote[]>;

  fetchFfzGlobalEmotes(): Promise<FfzEmote[]>;
  fetchFfzEmotes(channelId: string): Promise<FfzEmote[]>;

  fetch7tvGlobalEmotes(): Promise<SevenTvEmote[]>;
  fetch7tvEmotes(channelId: string): Promise<SevenTvEmote[]>;
}


interface BttvApiEmote {
  id: string;
  code: string;
  imageType: string;
  userId: string;
  user?: {
    id: string;
    name: string;
    displayName: string;
    providerId: string; // numeric string
  };
}

interface BttvApiChannelEmoteResponse {
  id: string;
  avatar: string;
  channelEmotes: [BttvApiEmote];
  sharedEmotes: [BttvApiEmote];
}

interface FfzApiEmote {
  id: number;
  name: string;
}

interface FfzApiEmoteSet {
  id: number;
  emoticons: FfzApiEmote[];
}

interface FfzApiEmoteSetResponse {
  set: FfzApiEmoteSet;
}

interface FfzApiRoomEmotesResponse {
  sets: {
    [setId: string]: FfzApiEmoteSet;
  };
}

interface SevenTvApiEmote {
  id: string;
  name: string;
  mime: string;
}


function convertToBttvEmote(apiEmote: BttvApiEmote): BttvEmote {
  return {
    provider: 'bttv',
    id: apiEmote.id,
    name: apiEmote.code,
    url: `https://cdn.betterttv.net/emote/${apiEmote.id}/1x`, // TODO: Support for larger size
  };
}


function convertToFfzEmote(apiEmote: FfzApiEmote): FfzEmote {
  return {
    provider: 'ffz',
    id: apiEmote.id.toString(),
    name: apiEmote.name,
    url: `https://cdn.frankerfacez.com/emote/${apiEmote.id}/1`, // TODO: Support for larger size
  };
}


function convertTo7tvEmote(apiEmote: SevenTvApiEmote): SevenTvEmote {
  return {
    provider: '7tv',
    id: apiEmote.id,
    name: apiEmote.name,
    url: `https://cdn.7tv.app/emote/${apiEmote.id}/1x`, // TODO: Support for larger size
  };
}


export class EmoteFetcher implements IEmoteFetcher {
  private _client: AxiosInstance;

  constructor() {
    this._client = axios.create({
      headers: {
        Accept: 'application/json',
      },
    });
  }

  async fetchBttvGlobalEmotes(): Promise<BttvEmote[]> {
    const response = await this._client.get<BttvApiEmote[]>(
      'https://api.betterttv.net/3/cached/emotes/global',
    );
    return response.data.map((apiEmote) => convertToBttvEmote(apiEmote));
  }

  async fetchBttvEmotes(channelId: string): Promise<BttvEmote[]> {
    const response = await this._client.get<BttvApiChannelEmoteResponse>(
      `https://api.betterttv.net/3/cached/users/twitch/${channelId}`,
    );

    const emotes: BttvEmote[] = [];
    response.data.channelEmotes.forEach((apiEmote) => {
      emotes.push(convertToBttvEmote(apiEmote));
    });
    response.data.sharedEmotes.forEach((apiEmote) => {
      emotes.push(convertToBttvEmote(apiEmote));
    });

    return emotes;
  }

  async fetchFfzGlobalEmotes(): Promise<FfzEmote[]> {
    // 3 is the set ID for the global emotes
    // This ID would rarely change, so it would be easier to directly fetch set 3.
    const response = await this._client.get<FfzApiEmoteSetResponse>(
      'https://api.frankerfacez.com/v1/set/3',
    );
    return response.data.set.emoticons.map((apiEmote) =>
      convertToFfzEmote(apiEmote),
    );
  }

  async fetchFfzEmotes(channelId: string): Promise<FfzEmote[]> {
    const response = await this._client.get<FfzApiRoomEmotesResponse>(
      `https://api.frankerfacez.com/v1/room/id/${channelId}`,
    );

    const emotes: FfzEmote[] = [];
    const apiEmoteSets = response.data.sets;
    for (const setId in response.data.sets) {
      const apiEmoteSet = apiEmoteSets[setId];
      apiEmoteSet.emoticons.forEach((apiEmote) => {
        emotes.push(convertToFfzEmote(apiEmote));
      });
    }

    return emotes;
  }

  async fetch7tvGlobalEmotes(): Promise<SevenTvEmote[]> {
    const response = await this._client.get<SevenTvApiEmote[]>(
      'https://api.7tv.app/v2/emotes/global',
    );
    return response.data.map((apiEmote) => convertTo7tvEmote(apiEmote));
  }

  async fetch7tvEmotes(channelId: string): Promise<SevenTvEmote[]> {
    const response = await this._client.get<SevenTvApiEmote[]>(
      `https://api.7tv.app/v2/users/${channelId}/emotes`,
    );
    return response.data.map((apiEmote) => convertTo7tvEmote(apiEmote));
  }
}
