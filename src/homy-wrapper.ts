import { HomySdk, HomySearchInfo } from './api/homy/homy-sdk.js';
import {
  IRentProvider,
  RentProviderId,
  RentProviderPlaceId,
  RentProviderTransactionId,
  RentSearchInfo,
  RentSearchResult,
} from './rent-abstraction';

export default class HomyProvider implements IRentProvider {
  readonly providerId: RentProviderId = 'homy';
  private readonly homySdk: HomySdk = new HomySdk();
  get(id: RentProviderPlaceId): Promise<RentSearchResult> {
    return Promise.reject(null);
  }
  search(parameters: RentSearchInfo): Promise<RentSearchResult[]> {
    if (!parameters.providerIds.some((id) => id === this.providerId)) {
      return Promise.resolve([]);
    }
    const homySearchInfo: HomySearchInfo = {
      city: parameters.city,
      checkInDate: parameters.checkInDate,
      checkOutDate: parameters.checkOutDate,
      priceLimit: parameters.maxPrice,
    };
    return this.homySdk
      .search(homySearchInfo)
      .then<RentSearchResult[]>((homyPlaces) => {
        const results: RentSearchResult[] = [];
        homyPlaces.forEach((homyPlace) =>
          results.push({
            providerPlaceId: {
              providerId: this.providerId,
              placeId: homyPlace.id.toString(),
            },
            name: homyPlace.name,
            description: homyPlace.description,
            image: [homyPlace.image],
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
  ): Promise<RentProviderTransactionId | null> {
    if (placeId.providerId !== this.providerId) {
      return Promise.resolve(null);
    }
    return Promise.resolve({
      providerId: this.providerId,
      transactionId: `${Date.now()}`,
    });
  }
}
