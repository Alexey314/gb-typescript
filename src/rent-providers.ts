import { FlatRentSdk } from './api/flat-rent/flat-rent-sdk.js';
import { HomySdk, HomySearchInfo } from './api/homy/homy-sdk.js';

const flatRentSdk = new FlatRentSdk();
const homySdk = new HomySdk();

export type RentSearchInfo = {
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  maxPrice: number;
  providerIds: string[];
};

export type ProviderId = string;

export type RentProviderPlaceId = {
  providerId: ProviderId;
  placeId: string;
};

export type RentSearchResult = {
  providerPlaceId: RentProviderPlaceId;
  name: string;
  description: string;
  image: string;
  remoteness: number | null;
  coordinates: [number, number] | null;
  bookedDates: string[];
  price: number;
};

export type RentProviderTransactionId = {
  providerId: ProviderId;
  transactionId: string;
};

export interface IRentProvider {
  search: (parameters: RentSearchInfo) => Promise<RentSearchResult[]>;
  book: (
    placeId: RentProviderPlaceId,
    checkInDate: Date,
    checkOutDate: Date
  ) => Promise<RentProviderTransactionId>;
}

class HomyWrapper implements IRentProvider {
  static readonly providerId: ProviderId = 'homy';
  search(parameters: RentSearchInfo) {
    const homySearchInfo: HomySearchInfo = {
      city: parameters.city,
      checkInDate: parameters.checkInDate,
      checkOutDate: parameters.checkOutDate,
      priceLimit: parameters.maxPrice,
    };
    return homySdk
      .search(homySearchInfo)
      .then<RentSearchResult[]>((homyPlaces) => {
        const results: RentSearchResult[] = [];
        homyPlaces.forEach((homyPlace) =>
          results.push({
            providerPlaceId: {
              providerId: HomyWrapper.providerId,
              placeId: homyPlace.id.toString(),
            },
            name: homyPlace.name,
            description: homyPlace.description,
            image: homyPlace.image,
            remoteness: homyPlace.remoteness,
            coordinates: null,
            bookedDates: homyPlace.bookedDates,
            price: homyPlace.price,
          })
        );
        return results;
      });
  }

  book(
    placeId: RentProviderPlaceId,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<RentProviderTransactionId> {
    return null;
  }
}

function createProvider(providerId: ProviderId): HomyWrapper | null {
  switch (providerId) {
    case HomyWrapper.providerId:
      return new HomyWrapper();
    default:
      console.error(`Rent provider '${providerId}' not supported`);
      return null;
  }
}

export class RentProviders implements IRentProvider {
  search(parameters: RentSearchInfo): Promise<RentSearchResult[]> {
      const providers: IRentProvider[] = [];
      const promises: Promise<RentSearchResult[]>[] = [];
      parameters.providerIds.forEach(id=>{
          const provider: IRentProvider | null = createProvider(id);
        if (provider){
            providers.push(provider);
            promises.push(provider.search(parameters));
        }
      });
      return Promise.all<RentSearchResult[]>(promises).then(allPrividersResults=>
        [].concat(...allPrividersResults));
  }
  book: (
    placeId: RentProviderPlaceId,
    checkInDate: Date,
    checkOutDate: Date
  ) => Promise<RentProviderTransactionId>;
}
