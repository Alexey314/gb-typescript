import { renderBlock } from './lib.js';
import { renderEmptyOrErrorSearchBlock, renderSearchResultsBlock } from './search-results.js';

export function renderSearchFormBlock(
  arrivalDate?: Date,
  departureDate?: Date
): void {
  const today = new Date();

  if (arrivalDate === undefined) {
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

  if (departureDate === undefined) {
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
          <!--<div class="providers">
            <label><input type="checkbox" name="provider" value="homy" checked /> Homy</label>
            <label><input type="checkbox" name="provider" value="flat-rent" checked /> FlatRent</label>
          </div>--!>
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

interface SearchFormData {
  city: string;
  checkInDate: string;
  checkOutDate: string;
  maxPrice: number;
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

export let searchRequest: SearchFormData;
export let searchResults: Place[] = [];
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

  const city: string = getInputTextValueById('city', '');
  const checkInDate: string = getInputTextValueById('check-in-date', '');
  const checkOutDate: string = getInputTextValueById('check-out-date', '');
  const maxPrice = Number(getInputTextValueById('max-price', ''));

  const searchFormData: SearchFormData = {
    city,
    checkInDate,
    checkOutDate,
    maxPrice,
  };


  search(searchFormData, (result: unknown) => {
    searchRequest = searchFormData;
    searchResultsTime = Date.now();
    if (result instanceof Error)
    {
      renderEmptyOrErrorSearchBlock(result.message);
      searchResults = [];
    }
    else
    {
      renderSearchResultsBlock(result as Place[]);
      searchResults = result as Place[];
    }
    // console.log('Search result: ', result);
  });
}



function search(
  searchData: SearchFormData,
  onComplete: (result: Error | Place[]) => void
): void {
  // console.log(searchData);
  fetch(
    `http://localhost:3001/places?city=${searchData.city}&checkInDate=${searchData.checkInDate}&checkOutDate=${searchData.checkOutDate}&maxPrice=${searchData.maxPrice}`
  )
    .then((response) => {
      // console.log(response);
      if (response.ok) {
        return response.json();
      }
      throw new Error('Search engine error');
    })
    .then((placesObj) => {
      const places: Place[] = [];
      for (const key in placesObj) {
        places.push(placesObj[key]);
      }
      onComplete(places);
    })
    .catch((error) => onComplete(error));
}
