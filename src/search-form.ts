import { FlatRentProvider } from './flat-rent-provider.js';
import { HomyProvider } from './homy-provider.js';
import { renderBlock } from './lib.js';
import { RentSearchInfo, RentSearchResult } from './rent-abstraction';
import { RentProviderComposer } from './rent-providers.js';
import {
  renderEmptyOrErrorSearchBlock,
  renderSortedSearchResultsBlock,
  sortSearchResultsBy,
} from './search-results.js';

export const rentProviders: RentProviderComposer = new RentProviderComposer();
rentProviders.add(new HomyProvider());
rentProviders.add(new FlatRentProvider());

export function renderSearchFormBlock(
  arrivalDate?: Date,
  departureDate?: Date
): void {
  const today = new Date();

  if (!arrivalDate) {
    arrivalDate = new Date(new Date().setDate(today.getDate() + 1));
  } else if (arrivalDate.getTime() < today.getTime()) {
    arrivalDate = today;
  }

  const lastDepartureDate = new Date(new Date(arrivalDate).setDate(1));
  lastDepartureDate.setMonth(lastDepartureDate.getMonth() + 1);
  lastDepartureDate.setDate(
    new Date(
      lastDepartureDate.getFullYear(),
      lastDepartureDate.getMonth() + 1,
      0
    ).getDate()
  );

  if (!departureDate) {
    departureDate = new Date(new Date().setDate(arrivalDate.getDate() + 2));
  } else if (departureDate > lastDepartureDate) {
    departureDate = lastDepartureDate;
  }

  const formatDate: (date: Date) => string = (date: Date) => {
    return `${date.getFullYear()}-${('0' + (date.getMonth() + 1)).slice(-2)}-${(
      '0' + date.getDate()
    ).slice(-2)}`;
  };

  const formattedArrivalDateMin = formatDate(today);
  const formattedArrivalDate = formatDate(arrivalDate);
  const formattedDepartureDate = formatDate(departureDate);
  const formattedDepartureDateMax = formatDate(lastDepartureDate);

  renderBlock(
    'search-form-block',
    `
    <form id="search-form">
      <fieldset class="search-filedset">
        <div class="row">
          <div>
            <label for="city">Город</label>
            <input id="city" type="text" disabled value="Санкт-Петербург" />
            <input type="hidden" disabled value="59.9386,30.3141" />
          </div>
          <div class="providers">
            <label><input type="checkbox" name="provider" value="homy" checked /> Homy</label>
            <label><input type="checkbox" name="provider" value="flat-rent" checked /> FlatRent</label>
          </div>
        </div>
        <div class="row">
          <div>
            <label for="check-in-date">Дата заезда</label>
            <input id="check-in-date" type="date" value=${formattedArrivalDate} min=${formattedArrivalDateMin} max=${formattedDepartureDateMax} name="checkin" />
          </div>
          <div>
            <label for="check-out-date">Дата выезда</label>
            <input id="check-out-date" type="date" value=${formattedDepartureDate} min=${formattedArrivalDate} max=${formattedDepartureDateMax} name="checkout" />
          </div>
          <div>
            <label for="max-price">Макс. цена суток</label>
            <input id="max-price" type="text" value="" name="price" class="max-price" />
          </div>
          <div>
            <div><button type="submit">Найти</button></div>
          </div>
        </div>
      </fieldset>
    </form>
    `
  );

  const btnEl: HTMLElement | null = document.getElementById('search-form');
  if (btnEl instanceof HTMLElement) {
    btnEl.addEventListener('submit', (evt) => {
      evt.preventDefault();
      handleSearchForm();
    });
  } else {
    console.error('search-form element not found');
  }
}

export interface Place {
  id: number;
  name: string;
  description: string;
  image: string;
  remoteness: number;
  bookedDates: string[];
  price: number;
}

export let searchRequest: RentSearchInfo;
export let searchResults: RentSearchResult[] = [];
export let searchResultsTime: number;

export function handleSearchForm(): void {
  const getInputTextValueById: (id: string, defaultValue: string) => string = (
    id: string,
    defaultValue: string
  ) => {
    const el: HTMLInputElement | null = <HTMLInputElement>(
      document.getElementById(id)
    );
    const result: string = el === null ? defaultValue : el.value;
    return result;
  };

  const getSelectedProviders: () => string[] = () => {
    const checkboxList: NodeListOf<Element> = document.querySelectorAll(
      '#search-form .providers input[name="provider"]'
    );

    const result: string[] = [];
    checkboxList.forEach((node) => {
      if ((node as HTMLInputElement).checked) {
        result.push((node as HTMLInputElement).value);
      }
    });

    return result;
  };

  const city: string = getInputTextValueById('city', '');
  const checkInDate: string = getInputTextValueById('check-in-date', '');
  const checkOutDate: string = getInputTextValueById('check-out-date', '');
  const maxPrice = Number(getInputTextValueById('max-price', ''));
  const selectedProviders: string[] = getSelectedProviders();
  console.log(selectedProviders);

  const searchFormData: RentSearchInfo = {
    city,
    checkInDate: new Date(checkInDate),
    checkOutDate: new Date(checkOutDate),
    maxPrice,
    providerIds: selectedProviders,
  };

  rentProviders
    .search(searchFormData)
    .then((results) => {
      searchRequest = searchFormData;
      searchResultsTime = Date.now();
      if (results.length) {
        renderSortedSearchResultsBlock(results, sortSearchResultsBy);
      } else {
        renderEmptyOrErrorSearchBlock(
          'Ничего не найдено. Попробуйте изменить параметры поиска.'
        );
      }
      searchResults = results;
    })
    .catch((error) => {
      if (error instanceof Error) {
        renderEmptyOrErrorSearchBlock(error.message);
      } else if (typeof error === 'object') {
        renderEmptyOrErrorSearchBlock(error.toString());
      }
      searchResults = [];
    });
}
