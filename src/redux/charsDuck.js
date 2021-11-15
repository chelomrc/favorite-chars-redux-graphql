import axios from 'axios';
import { updateDB, getFavorites } from '../firebase';
import ApolloClient, { gql } from 'apollo-boost'

// constants
const initialData = {
    fetching: false,
    fetchingFavotites: false,
    array: [],
    current: {},
    favorites: [],
    nextPage: 1
}

let URL = "https://rickandmortyapi.com/api/character";

let client = new ApolloClient({
    uri: "https://rickandmortyapi.com/graphql"
});

let UPDATE_PAGE = "UPDATE_PAGE";
let GET_CHARACTERS = 'GET_CHARACTERS';
let GET_CHARACTERS_SUCCESS = 'GET_CHARACTERS_SUCCESS';
let GET_CHARACTERS_ERROR = 'GET_CHARACTERS_ERROR';

let REMOVE_CHARACTER = 'REMOVE_CHARACTER';
let ADD_TO_FAVORITES = 'ADD_TO_FAVORITES';

let GET_FAVORITES = 'GET_FAVORITES';
let GET_FAVORITES_SUCCESS = 'GET_FAVORITES_SUCCESS';
let GET_FAVORITES_ERROR = 'GET_FAVORITES_ERROR';



// reducer
export default function reducer(state = initialData, action){
    switch (action.type) {
        case UPDATE_PAGE:
            return {
                ...state, 
                nextPage: action.payload
            }
        case GET_FAVORITES:
            return {
                ...state, 
                fetchingFavotites: true
            }
        case GET_FAVORITES_SUCCESS:
            return {
                ...state, 
                favorites: action.payload,
                fetchingFavotites: false
            }    
        case GET_FAVORITES_ERROR:
            return {
                ...state, 
                fetchingFavotites: false,
                error: action.payload
            }     
                     
        case ADD_TO_FAVORITES:
            return {
                ...state, 
                ...action.payload
            }
        case REMOVE_CHARACTER:
            return {
                ...state, 
                array: action.payload
            }

        case GET_CHARACTERS:
            return {
                ...state, 
                fetching: true
            }
        case GET_CHARACTERS_SUCCESS:
            return {
                ...state, 
                array: action.payload, 
                fetching: false
            }
        case GET_CHARACTERS_ERROR:
            return {
                ...state, 
                fetching: false,
                error: action.payload
            }

        default:
            return state;
    }
}

// actions (thunks)

export const retrievefavoritesAction = () => (dispatch, getState) => {
    dispatch({
        type: GET_FAVORITES
    });
    const { uid } = getState().user;
    return getFavorites(uid)
        .then(array => {
            dispatch({
                type: GET_FAVORITES_SUCCESS,
                payload: [...array]
            });
        })
        .catch(e => {
            console.log(e);
            dispatch({
                type: GET_FAVORITES_ERROR,
                payload: e.message
            });
        })
}

export const addTofavoritesAction = () => (dispatch, getState) => {
    const {array, favorites} = getState().characters;
    const { uid } = getState().user;
    let char = array.shift();
    favorites.push(char);
    updateDB(favorites, uid);
    dispatch({
        type: ADD_TO_FAVORITES,
        payload: {array: [...array], favorites: [...favorites]}
    })
}

export const removeCharacterAction = () => (dispatch, getState) => {
    const {array} = getState().characters;
    array.shift();
    if(!array.length){
        getCharactersAction()(dispatch, getState);
        return
    }
    dispatch({
        type: REMOVE_CHARACTER,
        payload: [...array]
    });

}

export const getCharactersAction = () => (dispatch, getState) => {
    const query = gql`
        query ($page: Int){
            characters(page: $page){
                info{
                  pages
                  next
                  prev
                }
                  results{
                  name
                  image
                }
              }
        }
    `
    dispatch({
        type: GET_CHARACTERS
    });
    const {nextPage} = getState().characters
    return client.query({
        query,
        variables: {page: nextPage}
    })
    .then(({ data, err }) => {
        if(err){
            dispatch({
                type: GET_CHARACTERS_ERROR,
                payload: err
            });
        }
        dispatch({
            type: GET_CHARACTERS_SUCCESS,
            payload: data.characters.results
        });
        dispatch({
            type: UPDATE_PAGE,
            payload: data.characters.info.next ?  data.characters.info.next : 1
        })
    })

}
