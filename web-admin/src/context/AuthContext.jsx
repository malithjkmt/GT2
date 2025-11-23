import { createContext, useContext, useState, useEffect } from 'react';
import {
  signInWithEmailAndPassword,
  signOut as firebaseSignOut,
  onAuthStateChanged
} from 'firebase/auth';
import { doc, getDoc } from 'firebase/firestore';
import { auth, db, COLLECTIONS } from '../config/firebase';

const AuthContext = createContext();

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, firebaseUser.uid));
          if (userDoc.exists()) {
            const userData = userDoc.data();
            // Only allow admin users
            if (userData.roles && userData.roles.includes('admin')) {
              setUser({
                id: firebaseUser.uid,
                email: firebaseUser.email,
                ...userData,
              });
            } else {
              await firebaseSignOut(auth);
              setUser(null);
            }
          }
        } catch (error) {
          console.error('Error fetching user:', error);
          setUser(null);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email, password) => {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const userDoc = await getDoc(doc(db, COLLECTIONS.USERS, userCredential.user.uid));
      const userData = userDoc.data();

      if (!userData.roles || !userData.roles.includes('admin')) {
        await firebaseSignOut(auth);
        throw new Error('Unauthorized: Admin access only');
      }

      return userCredential;
    } catch (error) {
      throw error;
    }
  };

  const signOut = async () => {
    try {
      await firebaseSignOut(auth);
    } catch (error) {
      throw error;
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signOut,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
