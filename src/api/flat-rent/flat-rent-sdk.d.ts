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
  private database: DbItem[];

  constructor();

  get: (id: string) => Promise<FlatRentSearchResult>;

  search: (parameters: FlatRentSearchInfo) => Promise<FlatRentSearchResult[]>;

  book: (
    flatId: string,
    checkInDate: Date,
    checkOutDate: Date
  ) => Promise<FlatRentTransactionId>;

  /**
   * @throws {Error}
   */
  private _assertDatesAreCorrect: (
    checkInDate: Date,
    checkOutDate: Date
  ) => void;

  private _resetTime: (date: Date) => void;

  private _calculateDifferenceInDays: (
    startDate: Date,
    endDate: Date
  ) => number;

  private _generateDateRange: (from: Date, to: Date) => Date[];

  private _generateTransactionId: () => FlatRentTransactionId;

  private _areAllDatesAvailable: (flat: DbItem, dateRange: Date[]) => boolean;

  private _formatFlatObject: (
    flat: DbItem,
    nightNumber: number
  ) => FlatRentSearchResult;

  private _readDatabase(): () => DbItem[] | null;

  private _writeDatabase: (database: DbItem[]) => void;

  private _syncDatabase: (database: DbItem[]) => void;
}
