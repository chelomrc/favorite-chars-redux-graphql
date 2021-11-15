import firebase from 'firebase/compat/app';
import { getAuth, signOut, signInWithPopup, GoogleAuthProvider } from "firebase/auth";
import 'firebase/compat/firestore'
const firebaseConfig = {
  apiKey: "AIzaSyCNT6Lf9q1pCE2eMHKbHpTUmRiMQCHUkmc",
  authDomain: "app-redux-b81b1.firebaseapp.com",
  projectId: "app-redux-b81b1",
  storageBucket: "app-redux-b81b1.appspot.com",
  messagingSenderId: "960658594293",
  appId: "1:960658594293:web:312b5f84b79174daa728bc",
  measurementId: "G-D1W1EJZVJY"
};

// Initialize Firebase
// const app = initializeApp(firebaseConfig);
firebase.initializeApp(firebaseConfig);

const db = firebase.firestore().collection('favs');

export function getFavorites(uid){
  console.log('getFavorites');
  return db.doc(uid).get()
    .then(snap => {
      return snap.data().array;
    })
}

export function updateDB(array, uid){
    return db.doc(uid).set({array})
}

export function singOutGoogle() {
    const auth = getAuth();
    signOut(auth).then(() => {
      // Sign-out successful.
      console.log('Sign-out successful')
    }).catch((error) => {
      // An error happened.
      console.log(error)
    });
}
export function loginWithGoogle(){

    let provider = new GoogleAuthProvider();
    const auth = getAuth();
    return signInWithPopup(auth, provider)
    .then(snap => snap.user);
}