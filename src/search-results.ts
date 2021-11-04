import { renderBlock } from './lib.js';
import { Place } from './search-form';
import { toggleFavoriteItem, getFavoriteItems, isInFavoriteItems } from './user.js';

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

export function renderSearchResultsBlock(places: Place[]) {
  const favoriteItems = getFavoriteItems();
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
    ${places.reduce<string>(
      (prev: string, place: Place) =>
        prev +
        `<li class="result">
        <div class="result-container">
          <div class="result-img-container">
            <div class="favorites${isInFavoriteItems(favoriteItems, place.id) ? ' active' : ''} " data-place-id="${place.id}""></div>
            <img class="result-img" src="${place.image}" alt="">
          </div>
          <div class="result-info">
            <div class="result-info--header">
              <p>${place.name}</p>
              <p class="price">${place.price}&#8381;</p>
            </div>
            <div class="result-info--map"><i class="map-icon"></i> ${place.remoteness}км от вас</div>
            <div class="result-info--descr">${place.description}</div>
            <div class="result-info--footer">
              <div>
                <button>Забронировать</button>
              </div>
            </div>
          </div>
        </div>
      </li>\n`,
      ''
    )}

    </ul>
    `
  );

  const searchResultsBlock = document.getElementById('search-results-block');

  if (searchResultsBlock) {
    searchResultsBlock.addEventListener(
      'click',
      handleSearchResultsClick
    );
  }
}

function handleSearchResultsClick(event: unknown) {
  if (event instanceof PointerEvent)
  {
    const target = event.target as HTMLElement;
    console.log(target);
    if ( target.classList.contains('favorites') )
    {
      event.preventDefault();

      const placeIdAttr = target.attributes.getNamedItem('data-place-id');
      if (placeIdAttr === null)
      {
        console.error('No data-place-id attribute in search result item favorites icon');
        return;
      }

      const placeId = Number(placeIdAttr.value);
      if (isNaN(placeId))
      {
        console.error('data-place-id attribute of search result item is NaN');
        return;
      }

      const inFavorites = toggleFavoriteItem(placeId);

      console.log(placeId);

      target.classList.toggle('active', inFavorites);
    }
  }
}
