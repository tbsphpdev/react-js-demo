import { map, filter } from 'lodash';
import { createSlice } from '@reduxjs/toolkit';
import { API_BASE_URLS } from 'utils/constant';
import { recentTransactionState } from '@customTypes/transaction';
import { dispatch } from '../store';
// utils
import axios from '../../utils/axios';
import {
  Friend,
  Gallery,
  Profile,
  UserPost,
  Follower,
  UserData,
  CreditCard,
  UserInvoice,
  UserManager,
  UserAddressBook,
  NotificationSettings
} from '../../@customTypes/user';

// ----------------------------------------------------------------------

type ids = {
  id: string;
  subid: string;
};

type UserState = {
  isLoading: boolean;
  error: boolean;
  myProfile: null | Profile;
  posts: UserPost[];
  users: UserData[];
  userList: UserManager[];
  followers: Follower[];
  friends: Friend[];
  gallery: Gallery[];
  cards: CreditCard[] | null;
  addressBook: UserAddressBook[];
  invoices: UserInvoice[];
  notifications: NotificationSettings | null;
  transactionlist: recentTransactionState[];
  totalpage: number;
};

type filterotntype = {
  status: string[];
  mid: string[];
  transactionMethod: string[];
  action: string[];
  date: { startDate: string; endDate: string };
  customerName: string;
  email: string;
  references: string;
  amount: string;
  lastFour: string;
  createdBy: string;
  merchantId: string[];
  merchantSelectedName: string[];
};

const initialState: UserState = {
  isLoading: false,
  error: false,
  myProfile: null,
  posts: [],
  users: [],
  userList: [],
  followers: [],
  friends: [],
  gallery: [],
  cards: null,
  addressBook: [],
  invoices: [],
  notifications: null,
  transactionlist: [],
  totalpage: 0
};

const slice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // START LOADING
    startLoading(state) {
      state.isLoading = true;
    },

    // HAS ERROR
    hasError(state, action) {
      state.isLoading = false;
      state.error = action.payload;
    },

    // GET PROFILE
    getProfileSuccess(state, action) {
      state.isLoading = false;
      state.myProfile = action.payload;
    },

    // GET POSTS
    getPostsSuccess(state, action) {
      state.isLoading = false;
      state.posts = action.payload;
    },

    // GET USERS
    getUsersSuccess(state, action) {
      state.isLoading = false;
      state.users = action.payload;
    },

    // GET TRANSACTIONLIST
    getTransactionSuccess(state, action) {
      state.transactionlist = action.payload.transactions;
      state.totalpage = Math.ceil(action.payload.count / action.payload.rowsPerPage);
      state.isLoading = false;
    },

    // CLEAR TRANSACTIONLIST
    getTransactionClear(state) {
      state.isLoading = false;
      state.transactionlist = [];
      state.totalpage = 0;
    },

    // CANCEL TRANSACTIONLIST
    getTransactionCancel(state, action) {
      const prevdata = [...state.transactionlist];
      const prevobj = { ...prevdata[action.payload], status: 'cancelled' };
      prevdata.splice(action.payload, 1, prevobj);
      state.transactionlist = [...prevdata];
    },

    // DELETE USERS
    deleteUserSuccess(state, action) {
      const deleteUser = filter(state.userList, (user) => user.userSubId !== action.payload);
      state.userList = deleteUser;
    },

    // GET FOLLOWERS
    getFollowersSuccess(state, action) {
      state.isLoading = false;
      state.followers = action.payload;
    },

    // ON TOGGLE FOLLOW
    onToggleFollow(state, action) {
      const followerId = action.payload;

      const handleToggle = map(state.followers, (follower) => {
        if (follower.id === followerId) {
          return {
            ...follower,
            isFollowed: !follower.isFollowed
          };
        }
        return follower;
      });

      state.followers = handleToggle;
    },

    // GET FRIENDS
    getFriendsSuccess(state, action) {
      state.isLoading = false;
      state.friends = action.payload;
    },

    // GET GALLERY
    getGallerySuccess(state, action) {
      state.isLoading = false;
      state.gallery = action.payload;
    },

    // GET MANAGE USERS
    getUserListSuccess(state, action) {
      state.isLoading = false;
      state.userList = [...action.payload];
      state.error = false;
    },

    clearUserListSuccess(state) {
      state.userList = [];
      state.error = false;
    },

    // GET CARDS
    getCardsSuccess(state, action) {
      state.isLoading = false;
      state.cards = action.payload;
    },

    // GET ADDRESS BOOK
    getAddressBookSuccess(state, action) {
      state.isLoading = false;
      state.addressBook = action.payload;
    },

    // GET INVOICES
    getInvoicesSuccess(state, action) {
      state.isLoading = false;
      state.invoices = action.payload;
    },

    // GET NOTIFICATIONS
    getNotificationsSuccess(state, action) {
      state.isLoading = false;
      state.notifications = action.payload;
    }
  }
});

// Reducer
export default slice.reducer;

// Actions
export const { onToggleFollow } = slice.actions;

// ----------------------------------------------------------------------

export function getProfile() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/profile');
      dispatch(slice.actions.getProfileSuccess(response.data.profile));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getPosts() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/posts');
      dispatch(slice.actions.getPostsSuccess(response.data.posts));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getFollowers() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/social/followers');
      dispatch(slice.actions.getFollowersSuccess(response.data.followers));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getFriends() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/social/friends');
      dispatch(slice.actions.getFriendsSuccess(response.data.friends));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getGallery() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/social/gallery');
      dispatch(slice.actions.getGallerySuccess(response.data.gallery));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getUserList() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get(`/${API_BASE_URLS.user}/merchant/users`);
      dispatch(slice.actions.getUserListSuccess(response.data.message));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

export function clearUserList() {
  return dispatch(slice.actions.clearUserListSuccess());
}

// ----------------------------------------------------------------------

export function getCards() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/account/cards');
      dispatch(slice.actions.getCardsSuccess(response.data.cards));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getAddressBook() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/account/address-book');
      dispatch(slice.actions.getAddressBookSuccess(response.data.addressBook));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getInvoices() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/account/invoices');
      dispatch(slice.actions.getInvoicesSuccess(response.data.invoices));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getNotifications() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/account/notifications-settings');
      dispatch(slice.actions.getNotificationsSuccess(response.data.notifications));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}

// ----------------------------------------------------------------------

export function getUsers() {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      const response = await axios.get('/api/user/all');
      dispatch(slice.actions.getUsersSuccess(response.data.users));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
//-----------------------------------------------------------------------------
// export function deleteUser(userId: string) {
//   return async () => {
//     dispatch(slice.actions.startDeleteLoading());
//     try {
//       const response = await axios.delete(`${API_BASE_URLS.user}/merchant/users/${userId}`);
//       dispatch(slice.actions.deleteUserSuccess(userId));
//       dispatch(slice.actions.getUsersSuccess(response.data.users));
//     } catch (error) {
//       dispatch(slice.actions.hasError(error));
//     } finally {
//       dispatch(slice.actions.stopDeleteLoading());
//     }
//   };
// }

export function deleteUserSuccessfunc(userId: string, userdata: any) {
  dispatch(slice.actions.deleteUserSuccess(userId));
  dispatch(slice.actions.getUsersSuccess(userdata));
}

//-----------------------------------------------------------------------------
export function resendInvite(email: string) {
  return async () => {
    await axios.post(`${API_BASE_URLS.user}/merchant/users/resend`, {
      email
    });
  };
}
//-----------------------------------------------------------------------------
export function resetPassword(email: string) {
  return async () => {
    try {
      await axios.post(`${API_BASE_URLS.user}/merchant/users/resend`, {
        email
      });
      // dispatch(slice.actions.hasError(response));
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
//-----------------------------------------------------------------------------

export function clearTransactionList() {
  return dispatch(slice.actions.getTransactionClear());
}

export function cancelTransaction(index: number) {
  return dispatch(slice.actions.getTransactionCancel(index));
}

export function getTransactionList(state?: any, iddata?: ids) {
  return async () => {
    dispatch(slice.actions.startLoading());
    try {
      if (state) {
        const { rowsPerPage, page, filteroptions } = state;
        let queries = '';
        for (const key of Object.keys(filteroptions)) {
          if (
            key !== 'status' &&
            key !== 'date' &&
            key !== 'mid' &&
            key !== 'transactionMethod' &&
            key !== 'action' &&
            key !== 'merchantId' &&
            key !== 'merchantSelectedName'
          ) {
            if ((filteroptions as any)[key] !== '') {
              queries += `&${key}=${(filteroptions as any)[key].replace('+', '')}`;
            }
          } else if (
            key === 'status' ||
            key === 'mid' ||
            key === 'transactionMethod' ||
            key === 'action' ||
            key === 'merchantId'
          ) {
            if ((filteroptions as filterotntype)[key].length !== 0) {
              queries += `&${key}=${(filteroptions as filterotntype)[key].join(',')}`;
            }
          } else if (key === 'date') {
            if (
              (filteroptions as filterotntype)[key].startDate !== '' &&
              (filteroptions as filterotntype)[key].endDate !== ''
            ) {
              queries += `&startDate=${(filteroptions as filterotntype)[key].startDate}&endDate=${
                filteroptions.date.endDate
              }`;
            }
          }
        }
        if (iddata?.id) {
          if (iddata.id.includes('rpt')) {
            if (iddata?.id && iddata?.subid) {
              const response = await axios.get(
                `${API_BASE_URLS.transaction}/transactions/repeat/view/${iddata.id}/schedule/${
                  iddata.subid
                }?limit=${rowsPerPage}&offset=${rowsPerPage * (page - 1)}`
              );
              dispatch(
                slice.actions.getTransactionSuccess({ ...response.data.message, rowsPerPage })
              );
            } else {
              const response = await axios.get(
                `${API_BASE_URLS.transaction}/transactions/repeat/view/${
                  iddata.id
                }?limit=${rowsPerPage}&offset=${rowsPerPage * (page - 1)}`
              );
              dispatch(
                slice.actions.getTransactionSuccess({ ...response.data.message, rowsPerPage })
              );
            }
          } else {
            const response = await axios.get(
              `${API_BASE_URLS.transaction}/transactions/${iddata.id}?limit=${rowsPerPage}&offset=${
                rowsPerPage * (page - 1)
              }`
            );
            dispatch(
              slice.actions.getTransactionSuccess({ ...response.data.message, rowsPerPage })
            );
          }
        } else {
          const response = await axios.get(
            `${API_BASE_URLS.transaction}/transactions?limit=${rowsPerPage}&offset=${
              rowsPerPage * (page - 1)
            }${queries}`
          );
          dispatch(slice.actions.getTransactionSuccess({ ...response.data.message, rowsPerPage }));
        }
      } else {
        const response = await axios.get(
          `${API_BASE_URLS.transaction}/transactions?limit=5&offset=0`
        );
        dispatch(slice.actions.getTransactionSuccess({ ...response.data.message, rowsPerPage: 5 }));
      }
    } catch (error) {
      dispatch(slice.actions.hasError(error));
    }
  };
}
