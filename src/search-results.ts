import { renderBlock, renderToast } from './lib.js';
import {
  RentProviderPlaceId,
  RentSearchResult,
  stringifyRentProviderPlaceId,
} from './rent-providers.js';
import {
  handleSearchForm,
  Place,
  searchRequest,
  searchResults,
  searchResultsTime,
} from './search-form.js';
import {
  toggleFavoriteItem,
  getFavoriteItems,
  isInFavoriteItems,
} from './user.js';

const SEARCH_RESULT_EXPIRATION_TIME = 5 * 60 * 1000;

export function renderSearchStubBlock() {
  renderBlock(
    'search-results-block',
    `
    <div class="before-results-block">
      <img src="img/start-search.png" />
      <p>Чтобы начать поиск, заполните форму и&nbsp;нажмите "Найти"</p>
    </div>
    `
  );
}

export function renderEmptyOrErrorSearchBlock(reasonMessage: string) {
  renderBlock(
    'search-results-block',
    `
    <div class="no-results-block">
      <img src="img/no-results.png" />
      <p>${reasonMessage}</p>
    </div>
    `
  );
}

export function renderSearchResultsBlock(places: RentSearchResult[]) {
  const favoriteItems = getFavoriteItems();
  const getLocationHTML = (place: RentSearchResult): string => {
    if (place.remoteness != null) {
      return `${place.remoteness} км от вас`;
    }
    if (place.coordinates != null) {
      return `<a href="https://www.google.com/maps/@${place.coordinates[0]},${place.coordinates[1]},20z">
      ${place.coordinates[0]}, ${place.coordinates[1]}
      </a>`;
    }
    return '';
  };

  renderBlock(
    'search-results-block',
    `
    <div class="search-results-header">
        <p>Результаты поиска</p>
        <div class="search-results-filter">
            <span><i class="icon icon-filter"></i> Сортировать:</span>
            <select>
                <option selected="">Сначала дешёвые</option>
                <option selected="">Сначала дорогие</option>
                <option>Сначала ближе</option>
            </select>
        </div>
    </div>
    <ul class="results-list">
    ${places.reduce<string>((prev: string, place: RentSearchResult) => {
      const placeIdString = stringifyRentProviderPlaceId(place);
      return (
        prev +
        `<li class="result">
        <div class="result-container">
          <div class="result-img-container">
            <div class="favorites${
              isInFavoriteItems(favoriteItems, placeIdString) ? ' active' : ''
            } " data-place-id="${placeIdString}""></div>
            <img class="result-img" src="${place.image[0]}" alt="">
          </div>
          <div class="result-info">
            <div class="result-info--header">
              <p>${place.name}</p>
              <p class="price">${place.price}&#8381;</p>
            </div>
            <div class="result-info--map">
            <i class="map-icon"></i> ${getLocationHTML(place)}</div>
            <div class="result-info--descr">${place.description}</div>
            <div class="result-info--footer">
              <div>
                <button name="make-order"
                  data-place-id="${placeIdString}">
                Забронировать
                </button>
              </div>
            </div>
          </div>
        </div>
      </li>\n`
      );
    }, '')}

    </ul>
    `
  );

  const searchResultsBlock = document.getElementById('search-results-block');

  if (searchResultsBlock) {
    searchResultsBlock.addEventListener('click', handleSearchResultsClick);
  }
}

function getPlaceIdFromHtmlElement(element: HTMLElement): string | null {
  const placeIdAttr = element.attributes.getNamedItem('data-place-id');
  if (placeIdAttr === null) {
    console.error(
      'No data-place-id attribute in search result item favorites icon'
    );
    return null;
  }

  return placeIdAttr.value;
}

function handleSearchResultsClick(event: unknown) {
  if (event instanceof PointerEvent) {
    const target = event.target as HTMLElement;
    // console.log(target);
    if (target.classList.contains('favorites')) {
      event.preventDefault();

      const placeId = getPlaceIdFromHtmlElement(target);
      if (!placeId) {
        return;
      }

      const inFavorites = toggleFavoriteItem(placeId);

      // console.log(placeId);

      target.classList.toggle('active', inFavorites);
    } else if (target.attributes.getNamedItem('name')?.value == 'make-order') {
      event.preventDefault();
      const placeIdString = getPlaceIdFromHtmlElement(target);
      if (!placeIdString) {
        return;
      }

      const rentProviderPlaceId: RentProviderPlaceId = JSON.parse(
        placeIdString
      ) as RentProviderPlaceId;
      if (
        typeof rentProviderPlaceId.providerId !== 'string' ||
        typeof rentProviderPlaceId.placeId !== 'string'
      ) {
        console.error(
          `Place id in result HTML is bad formatted: ${placeIdString}`
        );
        return;
      }

      if (searchResultsTime + SEARCH_RESULT_EXPIRATION_TIME > Date.now()) {
        requestBooking(
          rentProviderPlaceId,
          searchRequest.checkInDate,
          searchRequest.checkOutDate,
          onRequestBookingComplete
        );
      } else {
        renderToast(
          {
            text: 'Данные о бронировании устарели, нужно их обновить.',
            type: 'error',
          },
          {
            name: 'Обновить',
            handler: handleSearchForm,
          }
        );
      }
    }
  }
}

interface BookingApiResult {
  status: string;
}

function requestBooking(
  providerPlaceId: RentProviderPlaceId,
  checkInDate: Date,
  checkOutDate: Date,
  onComplete: (result: BookingApiResult, error?: Error) => void
) {
  fetch(
    `http://localhost:3001/booking?placeId=${providerPlaceId.placeId}&checkInDate=${checkInDate}&checkOutDate=${checkOutDate}`
  )
    .then<BookingApiResult>((response) => {
      // console.log(response);
      if (response.ok) {
        return response.json();
      }
      throw new Error('Booking engine error');
    })
    .then<void>((result: BookingApiResult) => {
      if (typeof result.status === 'string') {
        onComplete(result);
      } else {
        throw new Error('Booking engine result format error');
      }
    })
    .catch((error) => onComplete({ status: 'unknown' }, error));
}

function onRequestBookingComplete(
  result: BookingApiResult,
  error?: Error
): void {
  if (result.status === 'OK') {
    renderToast(
      {
        text: 'Бронирование выполнено успешно!',
        type: 'success',
      },
      {
        name: 'Закрыть',
        handler: () => {
          // console.log('Уведомление закрыто');
        },
      }
    );
  } else if (error) {
    renderToast(
      {
        text: `Ошибка, бронирование не выполнено! ${error.message}`,
        type: 'error',
      },
      {
        name: 'Закрыть',
        handler: () => {
          // console.log('Уведомление закрыто');
        },
      }
    );
  }
}
