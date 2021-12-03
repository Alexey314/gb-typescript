import { renderBlock, renderToast } from './lib.js';
import { RentProviderPlaceId, RentSearchResult } from './rent-abstraction.js';
import {
  parseRentProviderPlaceId,
  stringifyRentProviderPlaceId,
} from './rent-providers.js';
import {
  handleSearchForm,
  rentProviders,
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

export const enum SearchResultsSortOptions {
  CHEAP_FIRST = 'cheap-first',
  EXPENSIVE_FIRST = 'expensive-first',
  NEAREST_FIRST = 'nearest-first',
}

function validateSearchResultsSortOptions(
  sortBy: string
): SearchResultsSortOptions {
  switch (sortBy) {
    case SearchResultsSortOptions.CHEAP_FIRST:
      return SearchResultsSortOptions.CHEAP_FIRST;
    case SearchResultsSortOptions.EXPENSIVE_FIRST:
      return SearchResultsSortOptions.EXPENSIVE_FIRST;
    case SearchResultsSortOptions.NEAREST_FIRST:
      return SearchResultsSortOptions.NEAREST_FIRST;
  }
  return SearchResultsSortOptions.CHEAP_FIRST;
}

export let sortSearchResultsBy: SearchResultsSortOptions =
  SearchResultsSortOptions.CHEAP_FIRST;

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
                <option value="${SearchResultsSortOptions.CHEAP_FIRST}"
                ${
                  sortSearchResultsBy === SearchResultsSortOptions.CHEAP_FIRST
                    ? 'selected="selected"'
                    : ''
                }>Сначала дешёвые</option>
                <option value="${SearchResultsSortOptions.EXPENSIVE_FIRST}"
                ${
                  sortSearchResultsBy ===
                  SearchResultsSortOptions.EXPENSIVE_FIRST
                    ? 'selected="selected"'
                    : ''
                }>Сначала дорогие</option>
                <option value="${SearchResultsSortOptions.NEAREST_FIRST}"
                ${
                  sortSearchResultsBy === SearchResultsSortOptions.NEAREST_FIRST
                    ? 'selected="selected"'
                    : ''
                }>Сначала ближе</option>
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
    searchResultsBlock.addEventListener('change', handleSearchResultsChange);
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

      const rentProviderPlaceId: RentProviderPlaceId | null =
        parseRentProviderPlaceId(placeIdString);
      if (rentProviderPlaceId === null) {
        console.error(
          `Place id in result HTML is bad formatted: ${placeIdString}`
        );
        return;
      }

      if (searchResultsTime + SEARCH_RESULT_EXPIRATION_TIME > Date.now()) {
        rentProviders
          .book(
            rentProviderPlaceId,
            searchRequest.checkInDate,
            searchRequest.checkOutDate
          )
          .then((transactionId) => {
            if (transactionId !== null) {
              renderToast(
                {
                  text: `Бронирование выполнено успешно! Идентификатор транзакции '${transactionId.transactionId}'`,
                  type: 'success',
                },
                {
                  name: 'Закрыть',
                  handler: () => {
                    // console.log('Уведомление закрыто');
                  },
                }
              );
            }
          })
          .catch((error) => {
            renderToast(
              {
                text: `Ошибка, бронирование не выполнено! ${
                  error instanceof Error ? error.message : ''
                }`,
                type: 'error',
              },
              {
                name: 'Закрыть',
                handler: () => {
                  // console.log('Уведомление закрыто');
                },
              }
            );
          });
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

export function renderSortedSearchResultsBlock(
  items: RentSearchResult[],
  sortBy: SearchResultsSortOptions
): void {
  switch (sortBy) {
    case SearchResultsSortOptions.EXPENSIVE_FIRST:
      renderSearchResultsBlock(items.sort((a, b) => b.price - a.price));
      break;
    case SearchResultsSortOptions.NEAREST_FIRST:
      renderSearchResultsBlock(
        items.sort((a, b) =>
          b.remoteness !== null && a.remoteness !== null
            ? b.remoteness - a.remoteness
            : 0
        )
      );
      break;
    case SearchResultsSortOptions.CHEAP_FIRST:
    default:
      renderSearchResultsBlock(items.sort((a, b) => a.price - b.price));
      break;
  }
}

function handleSearchResultsChange(event: Event): void {
  console.log(event);
  if (event instanceof Event && event.target instanceof HTMLSelectElement) {
    event.preventDefault();
    const select = event.target as HTMLSelectElement;
    const sortBy = validateSearchResultsSortOptions(select.value);
    sortSearchResultsBy = sortBy;
    renderSortedSearchResultsBlock(searchResults, sortBy);
  }
}
