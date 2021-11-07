//   type DbItem = {
//     id: string;
//     title: string;
//     details: string;
//     photos: string[];
//     coordinates: [number, number];
//     bookedDates: string[];
//     price: number;
//   }

  export type FlatRentSearchResult = {
    id: string;
    title: string;
    details: string;
    photos: string[];
    coordinates: [number, number];
    bookedDates: string[];
    totalPrice: number;
  }

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
  }

  export interface FlatRentSdk {
    // database: DbItem[];

    get: (id: string) => Promise<FlatRentSearchResult | null>;

    search: (
      parameters: FlatRentSearchInfo
    ) => Promise<FlatRentSearchResult[] | Error>;

    book: (
      flatId: number,
      checkInDate: Date,
      checkOutDate: Date
    ) => Promise<FlatRentTransactionId | Error>;


    // /**
    //  * @throws {Error}
    //  */
    // _assertDatesAreCorrect: (checkInDate: Date, checkOutDate: Date) => void;

    // _resetTime: (date: Date) => void;

    // _calculateDifferenceInDays: (startDate: Date, endDate: Date) => number;

    // _generateDateRange: (from: Date, to: Date) => Date[];

    // _generateTransactionId: () => FlatRentTransactionId;

    // _areAllDatesAvailable: (flat: DbItem, dateRange: Date[]) => boolean;

    // _formatFlatObject: (
    //   flat: DbItem,
    //   nightNumber: number
    // ) => FlatRentSearchResult;

    // _readDatabase(): () => DbItem[] | null;

    // _writeDatabase: (database: DbItem[]) => void;

    // _syncDatabase: (database: DbItem[]) => void;
  }
