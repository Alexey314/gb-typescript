const database: HomySearchResult[] = [
  {
    id: 1,
    name: 'YARD Residence Apart-hotel',
    description:
      'Комфортный апарт-отель в самом сердце Санкт-Петербрга. К услугам гостей номера с видом на город и бесплатный Wi-Fi.',
    image: 'http://localhost:8080/img/result-1.png',
    remoteness: 2.5,
    bookedDates: [],
    price: 2800,
  },
  {
    id: 2,
    name: 'Akyan St.Petersburg',
    description:
      'Отель Akyan St-Petersburg с бесплатным Wi-Fi на всей территории расположен в историческом здании Санкт-Петербурга',
    image: 'http://localhost:8080/img/result-2.png',
    remoteness: 1.5,
    bookedDates: [],
    price: 5800,
  },
  {
    id: 3,
    name: 'Solo Sokos Hotel Palace Bridge',
    description:
      'Отель с wellness-центром расположен на Васильевском острове. Отель отличает наличие спа-центра и центральное местоположение.',
    image: 'http://localhost:8080/img/result-3.png',
    remoteness: 5.0,
    bookedDates: [],
    price: 10500,
  },
  {
    id: 4,
    name: 'Park Inn by Radisson Pulkovskaya Hotel',
    description:
      'Отель оборудован бизнес-центром, залами для совещаний и конференц-центром находится рядом с площадью Победы и парком Городов-Героев.',
    image: 'http://localhost:8080/img/result-4.png',
    remoteness: 15.3,
    bookedDates: [],
    price: 6600,
  },
];

export type HomySearchResult = {
  id: number;
  name: string;
  description: string;
  image: string;
  remoteness: number;
  bookedDates: string[];
  price: number;
};

export type HomySearchInfo = {
  city: string;
  checkInDate: Date;
  checkOutDate: Date;
  priceLimit: number;
};

export type HomyTransactionId = number;

export class HomySdk {
  search(parameters: HomySearchInfo): Promise<HomySearchResult[] | Error> {
    return new Promise<HomySearchResult[] | Error>((resolve, reject) => {
        resolve(database);
    });
  }

  book(
    flatId: number,
    checkInDate: Date,
    checkOutDate: Date
  ): Promise<HomyTransactionId | Error> {
    return new Promise<HomyTransactionId | Error>((resolve, reject) => {
        resolve(0);
    });
  }
}
