import {initializeApp,getApps} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-app.js';
import {getAuth,setPersistence,browserSessionPersistence,signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-auth.js';
import {getFirestore,doc,getDoc,setDoc,collection,query,where,limit,orderBy,getDocs,onSnapshot,serverTimestamp} from 'https://www.gstatic.com/firebasejs/13.0.0/firebase-firestore.js';
import {createFirebaseCloud} from './firebase-cloud.js';

export async function openFirebase(config,localProgress,storage){
 const name='calculus-royale';
 const app=getApps().find(app=>app.name===name)||initializeApp(config,name);
 const auth=getAuth(app);
 await setPersistence(auth,browserSessionPersistence);
 await auth.authStateReady();
 return createFirebaseCloud({auth,db:getFirestore(app),storage,localProgress,sdk:{
  signInWithEmailAndPassword,createUserWithEmailAndPassword,signOut,
  doc,getDoc,setDoc,collection,query,where,limit,orderBy,getDocs,onSnapshot,serverTimestamp
 }});
}
