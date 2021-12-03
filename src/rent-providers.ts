import {
  IRentProvider,
  RentProviderCollection,
  RentProviderPlaceId,
  RentProviderTransactionId,
  RentSearchInfo,
  RentSearchResult,
} from './rent-abstraction.js';

function b64EncodeUnicode(str: string) {
  // first we use encodeURIComponent to get percent-encoded UTF-8,
  // then we convert the percent encodings into raw bytes which
  // can be fed into btoa.
  return btoa(
    encodeURIComponent(str).replace(
      /%([0-9A-F]{2})/g,
      function toSolidBytes(_match, p1: string) {
        return String.fromCharCode(parseInt('0x' + p1));
      }
    )
  );
}

function b64DecodeUnicode(str: string) {
  // Going backwards: from bytestream, to percent-encoding, to original string.
  return decodeURIComponent(
    atob(str)
      .split('')
      .map(function (c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
      })
      .join('')
  );
}

export function stringifyRentProviderPlaceId(
  placeInfo: RentSearchResult | RentProviderPlaceId
): string {
  if (Object.prototype.hasOwnProperty.call(placeInfo, 'providerPlaceId')) {
    return b64EncodeUnicode(
      JSON.stringify((placeInfo as RentSearchResult).providerPlaceId)
    );
  } else {
    return JSON.stringify(placeInfo as RentProviderPlaceId);
  }
}

export function parseRentProviderPlaceId(
  stringToParse: string
): RentProviderPlaceId | null {
  try {
    const obj = JSON.parse(b64DecodeUnicode(stringToParse));
    if (
      Object.prototype.hasOwnProperty.call(obj, 'providerId') &&
      Object.prototype.hasOwnProperty.call(obj, 'placeId')
    ) {
      return obj as RentProviderPlaceId;
    }
  } catch (error) {
    if (error instanceof Error) {
      console.error(error.message);
    }
  }
  return null;
}

export class RentProviderComposer
  extends RentProviderCollection
  implements IRentProvider
{
  constructor() {
    super();
  }

  get(id: RentProviderPlaceId): Promise<RentSearchResult | null> {
    const promises: Promise<RentSearchResult | null>[] = this.providers.map(
      (provider) => provider.get(id)
    );
    return Promise.all<RentSearchResult | null>(promises).then(
      (allProvidersResults) => {
        console.log(allProvidersResults);
        const result = ([] as (RentSearchResult | null)[])
          .concat(...allProvidersResults)
          .find((result) => result !== null);
        return result === undefined ? null : result;
      }
    );
  }

  search(parameters: RentSearchInfo): Promise<RentSearchResult[]> {
    const promises: Promise<RentSearchResult[]>[] = this.providers.map(
      (provider) => provider.search(parameters)
    );
    return Promise.all<RentSearchResult[]>(promises).then(
      (allProvidersResults) => {
        console.log(allProvidersResults);
        return ([] as RentSearchResult[]).concat(...allProvidersResults);
      }
    );
  }

  book(
    placeId: RentProviderPlaceId,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<RentProviderTransactionId | null> {
    const promises: Promise<RentProviderTransactionId | null>[] =
      this.providers.map((provider) =>
        provider.book(placeId, checkInDate, checkOutDate)
      );
    return Promise.all<RentProviderTransactionId | null>(promises).then(
      (allProvidersResults) => {
        console.log(allProvidersResults);
        const result = ([] as (RentProviderTransactionId | null)[])
          .concat(...allProvidersResults)
          .filter((result) => result !== null);
        switch (result.length) {
          case 0:
            return Promise.reject(new Error('Unsupported provider'));
          case 1:
            return result[0] || null;
          default:
            return Promise.reject(new Error('Booked multiple provider'));
        }
      }
    );
  }
}
