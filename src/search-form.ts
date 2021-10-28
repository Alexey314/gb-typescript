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
    <form>
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
            <div><button>Найти</button></div>
          </div>
        </div>
      </fieldset>
    </form>
    `
  );
}
