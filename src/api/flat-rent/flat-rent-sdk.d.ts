export type DbItem = {
  id: string;
  title: string;
  details: string;
  photos: string[];
  coordinates: [number, number];
  bookedDates: string[];
  price: number;
};

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

export function cloneDate(date: Date): Date;

export function addDays(date: Date, days: number): Date;

export const backendPort: number;
export const localStorageKey: string;

export type FlatRentSearchInfo = {
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  priceLimit: number;
};

export class FlatRentSdk {

  constructor();

  get(id: string): Promise<FlatRentSearchResult>;

  search(parameters: FlatRentSearchInfo): Promise<FlatRentSearchResult[]>;

  book(
    flatId: string,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<FlatRentTransactionId>;

}
