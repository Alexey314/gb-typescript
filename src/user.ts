import { renderBlock } from './lib.js';

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
            <i class="heart-icon${hasFavoriteItems ? ' active' : ''}"></i>${favoritesCaption}
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
  const userInfo: unknown = localStorage.getItem('user');

  if (userInfo instanceof StorageUserKey) {
    return userInfo;
  } else {
    return {
      username: 'Wade Warren',
      avatarUrl: '/img/avatar.png',
    };
  }
}

export function getFavoritesAmount(): number {
  const favoritesAmount: unknown = localStorage.getItem('favoritesAmount');

  if (typeof favoritesAmount === 'number') {
    return favoritesAmount;
  } else {
    return 3;
  }
}

interface FavoriteItem {
  id: string;
  name: string;
  image: string;
}

function getFavoriteItems(): FavoriteItem[]{
  const stringifiedItems = localStorage.getItem('favoriteItems');
  if (stringifiedItems === null){
    return [];
  }
  return JSON.parse(stringifiedItems) || [];
}

export function toggleFavoriteItem(placeId: string): boolean {
  const favoriteItems: FavoriteItem[] = getFavoriteItems();
  const itemIndex = favoriteItems.findIndex((item: FavoriteItem) =>item.id === placeId);
  if (itemIndex == -1)
  {
    //TODO
    return true;
  }
  else
  {
    //TODO
    return false;
  }
}