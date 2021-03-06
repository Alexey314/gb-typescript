export type RentSearchInfo = {
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  maxPrice: number;
  providerIds: string[];
};

export type RentProviderId = string;

export type RentProviderPlaceId = {
  providerId: RentProviderId;
  placeId: string;
};

export type RentSearchResult = {
  providerPlaceId: RentProviderPlaceId;
  name: string;
  description: string;
  image: string[];
  remoteness: number | null;
  coordinates: [number, number] | null;
  bookedDates: string[];
  price: number;
};

export type RentProviderTransactionId = {
  providerId: RentProviderId;
  transactionId: string;
};

export interface IRentProvider {
  get(id: RentProviderPlaceId): Promise<RentSearchResult>;
  search(parameters: RentSearchInfo): Promise<RentSearchResult[]>;
  book(
    placeId: RentProviderPlaceId,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<RentProviderTransactionId | null>;
}

export class RentProviderCollection {
  protected providers: IRentProvider[] = [];

  add(child: IRentProvider): void {
    this.providers.push(child);
  }

  /**
   * @throws
   */
  remove(child: IRentProvider): void {
    const index = this.providers.indexOf(child);
    if (index > -1) {
      this.providers.splice(index, 1);
    } else {
      throw new Error(
        'Failed to remove provider from coolection: no given provider found.'
      );
    }
  }
}
