export type FlatRentSearchResult = {
  id: string;
  title: string;
  details: string;
  photos: string[];
  coordinates: [number, number];
  bookedDates: string[];
  totalPrice: number;
};

export type FlatRentTransactionId = number;

export type FlatRentSearchInfo = {
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  priceLimit: number;
};

export class FlatRentSdk {
  constructor();

  get: (id: string) => Promise<FlatRentSearchResult>;

  search: (parameters: FlatRentSearchInfo) => Promise<FlatRentSearchResult[]>;

  book: (
    flatId: number,
    checkInDate: Date,
    checkOutDate: Date
  ) => Promise<FlatRentTransactionId>;
}
