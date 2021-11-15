import { loginWithGoogle, singOutGoogle } from '../firebase'
import { retrievefavoritesAction } from './charsDuck'
// constants
let initialData = {
    loggedIn: false,
    fetching: false
}
let LOGIN = 'LOGIN';
let LOGIN_SUCCESS = 'LOGIN_SUCCESS';
let LOGIN_ERROR = 'LOGIN_ERROR';
let LOG_OUT = 'LOG_OUT';

// reducer
export default function reducer(state = initialData, action){
    switch (action.type) {
        case LOG_OUT:
            return { ...initialData }        
        case LOGIN_SUCCESS:
            return { ...state, fetching: false, ...action.payload, loggedIn: true}
        case LOGIN_ERROR:
            return { ...state, fetching: false, error: action.payload}    
        case LOGIN:
            return { ...state, fetching: true}
        default:
            return state;
    }
}

// aux
function saveStorage(storage) {
    localStorage.storage = JSON.stringify(storage);
}

// actions
export const logOutAction = () => (dispatch, getState) => {
    singOutGoogle();
    dispatch({
        type: LOG_OUT
    });
    localStorage.removeItem('storage');
}

export const restoreSessionAction = () => (dispatch, getState) => {
    let storage = JSON.parse(localStorage.getItem('storage'));
    if(storage && storage.user){
        dispatch({
            type: LOGIN_SUCCESS,
            payload: storage.user
        })
    }
}

export const doGoogleLoginAction = () => (dispatch, getState) => {
    dispatch({
        type: LOGIN
    })
    return loginWithGoogle()
        .then(user => {
            dispatch({
                type: LOGIN_SUCCESS,
                payload: {
                    uid: user.uid,
                    displayName: user.displayName,
                    email: user.email,
                    photoURL: user.photoURL
                }
            });
            saveStorage(getState());
            retrievefavoritesAction()(dispatch, getState);
        })
        .catch(e => {
            console.log(e);
            dispatch({
                type: LOGIN_ERROR,
                payload: e.message
            })
        })
}