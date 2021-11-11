import {
  FlatRentSdk,
  FlatRentSearchInfo,
  FlatRentSearchResult,
} from './api/flat-rent/flat-rent-sdk.js';
import {
  IRentProvider,
  RentProviderId,
  RentProviderPlaceId,
  RentProviderTransactionId,
  RentSearchInfo,
  RentSearchResult,
} from './rent-abstraction';

export default class FlatRentProvider implements IRentProvider {
  readonly providerId: RentProviderId = 'flat-rent';
  private readonly flatRentSdk: FlatRentSdk = new FlatRentSdk();
  get(_id: RentProviderPlaceId): Promise<RentSearchResult> {
    return Promise.reject(null);
  }
  search(parameters: RentSearchInfo) {
    if (!parameters.providerIds.some(id=>id === this.providerId)){
      return Promise.resolve([]);
    }
    const flatRentSearchInfo: FlatRentSearchInfo = {
      city: parameters.city,
      checkInDate: parameters.checkInDate,
      checkOutDate: parameters.checkOutDate,
      priceLimit: parameters.maxPrice,
    };
    return this.flatRentSdk
      .search(flatRentSearchInfo)
      .then<RentSearchResult[]>((flatRentPlaces: FlatRentSearchResult[]) => {
        const results: RentSearchResult[] = [];
        flatRentPlaces.forEach((flatRentPlace: FlatRentSearchResult) =>
          results.push({
            providerPlaceId: {
              providerId: this.providerId,
              placeId: flatRentPlace.id.toString(),
            },
            name: flatRentPlace.title,
            description: flatRentPlace.details,
            image: flatRentPlace.photos,
            remoteness: null,
            coordinates: flatRentPlace.coordinates,
            bookedDates: flatRentPlace.bookedDates,
            price: flatRentPlace.totalPrice,
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
    if (placeId.providerId !== this.providerId){
      return Promise.resolve(null);
    }

    return this.flatRentSdk
      .book(placeId.placeId, checkInDate, checkOutDate)
      .then<RentProviderTransactionId>((transactionId) => {
        const rentProviderTransactionId: RentProviderTransactionId = {
          providerId: placeId.providerId,
          transactionId: transactionId.toString(),
        };
        return rentProviderTransactionId;
      });
  }
}
