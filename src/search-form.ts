import { renderBlock } from './lib.js';

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

function handleSearchForm(): void {
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

  search(searchFormData, (result)=>{
    console.log('Search result: ', result);

  });
}

interface Place{
  id: number,
  name: string,
  description: string,
  image: string,
  remoteness: number,
  bookedDates: string[],
  price: number
}

function search(searchData: SearchFormData, onComplete: (result: Error|Place[])=>void): void {
  console.log(searchData);
  setTimeout(()=>{
    if (Math.random() > 0.5){
      onComplete(new Error('Search engine error'));
    }
    else{
      onComplete([]);
    }
  }, 3000);
}
