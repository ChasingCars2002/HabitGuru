import {
  signInAnonymously,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  linkWithCredential,
  EmailAuthProvider,
  signOut as firebaseSignOut,
  updateProfile,
  type User,
} from 'firebase/auth';
import { auth } from './firebase';

export async function signInAnon(): Promise<User> {
  const cred = await signInAnonymously(auth);
  return cred.user;
}

export async function signUpWithEmail(
  email: string,
  password: string,
  displayName?: string
): Promise<User> {
  const currentUser = auth.currentUser;

  // If already anonymous, link instead of creating a brand-new account
  // so existing local data is preserved under the same UID.
  if (currentUser?.isAnonymous) {
    const credential = EmailAuthProvider.credential(email, password);
    const linked = await linkWithCredential(currentUser, credential);
    if (displayName) {
      await updateProfile(linked.user, { displayName });
    }
    return linked.user;
  }

  const cred = await createUserWithEmailAndPassword(auth, email, password);
  if (displayName) {
    await updateProfile(cred.user, { displayName });
  }
  return cred.user;
}

export async function signInWithEmail(
  email: string,
  password: string
): Promise<User> {
  const cred = await signInWithEmailAndPassword(auth, email, password);
  return cred.user;
}

export async function signOut(): Promise<void> {
  await firebaseSignOut(auth);
}
