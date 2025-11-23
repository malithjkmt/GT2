import React, {createContext, useState, useEffect, useContext} from 'react';
import {Auth, Firestore, Collections} from '@/config/firebase';
import type {User} from '@/types';

interface AuthContextType {
  user: User | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (
    email: string,
    password: string,
    name: string,
    phoneNumber?: string,
  ) => Promise<void>;
  signOut: () => Promise<void>;
  updateUserProfile: (profile: Partial<User['profile']>) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{children: React.ReactNode}> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Subscribe to auth state changes
    const unsubscribe = Auth().onAuthStateChanged(async firebaseUser => {
      if (firebaseUser) {
        // Fetch user profile from Firestore
        try {
          const userDoc = await Firestore()
            .collection(Collections.USERS)
            .doc(firebaseUser.uid)
            .get();

          if (userDoc.exists) {
            const userData = userDoc.data();
            setUser({
              id: firebaseUser.uid,
              email: firebaseUser.email!,
              profile: userData?.profile || {name: ''},
              roles: userData?.roles || [],
              createdAt: userData?.createdAt?.toDate() || new Date(),
            });
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  const signIn = async (email: string, password: string) => {
    try {
      await Auth().signInWithEmailAndPassword(email, password);
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signUp = async (
    email: string,
    password: string,
    name: string,
    phoneNumber?: string,
  ) => {
    try {
      const userCredential = await Auth().createUserWithEmailAndPassword(
        email,
        password,
      );

      // Create user profile in Firestore
      await Firestore()
        .collection(Collections.USERS)
        .doc(userCredential.user.uid)
        .set({
          email,
          profile: {
            name,
            phoneNumber: phoneNumber || '',
          },
          roles: ['townsperson'],
          createdAt: Firestore.FieldValue.serverTimestamp(),
        });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const signOut = async () => {
    try {
      await Auth().signOut();
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const updateUserProfile = async (profile: Partial<User['profile']>) => {
    if (!user) {
      throw new Error('No user logged in');
    }

    try {
      await Firestore()
        .collection(Collections.USERS)
        .doc(user.id)
        .update({
          profile: {
            ...user.profile,
            ...profile,
          },
        });

      setUser({
        ...user,
        profile: {
          ...user.profile,
          ...profile,
        },
      });
    } catch (error: any) {
      throw new Error(error.message);
    }
  };

  const value = {
    user,
    loading,
    signIn,
    signUp,
    signOut,
    updateUserProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
