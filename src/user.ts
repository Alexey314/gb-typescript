import { renderBlock } from './lib.js';
import { Place, searchResults } from './search-form.js';

export function renderUserBlock(
  userName: string,
  userAvatarLink: string,
  favoriteItemsAmount: number
) {
  const favoritesCaption = favoriteItemsAmount
    ? favoriteItemsAmount
    : 'ничего нет';
  const hasFavoriteItems = favoriteItemsAmount ? true : false;

  renderBlock(
    'user-block',
    `
    <div class="header-container">
      <img class="avatar" src="${userAvatarLink}" alt="${userName}" />
      <div class="info">
          <p class="name">${userName}</p>
          <p class="fav">
            <i class="heart-icon${
              hasFavoriteItems ? ' active' : ''
            }"></i>${favoritesCaption}
          </p>
      </div>
    </div>
    `
  );
}

export class StorageUserKey {
  username: string;
  avatarUrl: string;
}

export function getUserData(): StorageUserKey {
  const anon: StorageUserKey = {
    username: 'Anonymous user',
    avatarUrl: '',
  };

  const userInfoJson = localStorage.getItem('user');

  try {
    const userInfo = JSON.parse(userInfoJson);
    if (
      typeof userInfo.username == 'string' &&
      typeof userInfo.avatarUrl == 'string'
    ) {
      return userInfo as StorageUserKey;
    }
    return anon;
  } catch (error) {
    return anon;
  }
  /*
  localStorage.setItem(
    'user',
    JSON.stringify({
      username: 'Wade Warren',
      avatarUrl: '/img/avatar.png',
    })
  );

  localStorage.setItem(
    'user',
   0
  );
  */
}

export function getFavoritesAmount(): number {
  return getFavoriteItems().length;
}

interface FavoriteItem {
  id: number;
  name: string;
  image: string;
}

export function getFavoriteItems(): FavoriteItem[] {
  const stringifiedItems = localStorage.getItem('favoriteItems');
  if (stringifiedItems === null) {
    return [];
  }
  return JSON.parse(stringifiedItems) || [];
}

export function isInFavoriteItems(
  items: FavoriteItem[],
  placeId: number
): boolean {
  return items.findIndex((item: FavoriteItem) => item.id === placeId) != -1;
}

export function setFavoriteItems(items: FavoriteItem[]): void {
  localStorage.setItem('favoriteItems', items ? JSON.stringify(items) : '');
}

export function toggleFavoriteItem(placeId: number): boolean {
  const favoriteItems: FavoriteItem[] = getFavoriteItems();
  const favoriteItemsIndex = favoriteItems.findIndex(
    (item: FavoriteItem) => item.id === placeId
  );

  if (favoriteItemsIndex == -1) {
    const searchResultsItem = searchResults.find(
      (item: Place) => item.id === placeId
    );

    if (searchResultsItem) {
      const newFavItem: FavoriteItem = {
        id: searchResultsItem.id,
        name: searchResultsItem.name,
        image: searchResultsItem.image,
      };
      favoriteItems.push(newFavItem);
      setFavoriteItems(favoriteItems);
      return true;
    } else {
      console.error(
        'Can not add favorite item: matching place id not found in search results'
      );
      return false;
    }
  } else {
    favoriteItems.splice(favoriteItemsIndex, 1);
    setFavoriteItems(favoriteItems);
    return false;
  }
}
