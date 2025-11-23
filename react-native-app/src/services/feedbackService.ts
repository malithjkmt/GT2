import {Firestore, Collections} from '@/config/firebase';
import type {Feedback, FeedbackMessage, FeedbackStatus} from '@/types';

export const createFeedback = async (
  userId: string,
  userName: string,
  subject: string,
  initialMessage: string,
): Promise<string> => {
  try {
    const message: FeedbackMessage = {
      senderId: userId,
      senderName: userName,
      message: initialMessage,
      timestamp: new Date(),
      isAdmin: false,
    };

    const docRef = await Firestore()
      .collection(Collections.FEEDBACK)
      .add({
        userId,
        userName,
        subject,
        messages: [message],
        status: 'open',
        createdAt: Firestore.FieldValue.serverTimestamp(),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
    return docRef.id;
  } catch (error: any) {
    throw new Error(`Error creating feedback: ${error.message}`);
  }
};

export const addMessageToFeedback = async (
  feedbackId: string,
  senderId: string,
  senderName: string,
  message: string,
  isAdmin: boolean = false,
): Promise<void> => {
  try {
    const newMessage: FeedbackMessage = {
      senderId,
      senderName,
      message,
      timestamp: new Date(),
      isAdmin,
    };

    await Firestore()
      .collection(Collections.FEEDBACK)
      .doc(feedbackId)
      .update({
        messages: Firestore.FieldValue.arrayUnion(newMessage),
        updatedAt: Firestore.FieldValue.serverTimestamp(),
      });
  } catch (error: any) {
    throw new Error(`Error adding message to feedback: ${error.message}`);
  }
};

export const updateFeedbackStatus = async (
  feedbackId: string,
  status: FeedbackStatus,
): Promise<void> => {
  try {
    await Firestore().collection(Collections.FEEDBACK).doc(feedbackId).update({
      status,
      updatedAt: Firestore.FieldValue.serverTimestamp(),
    });
  } catch (error: any) {
    throw new Error(`Error updating feedback status: ${error.message}`);
  }
};

export const getFeedback = async (
  feedbackId: string,
): Promise<Feedback | null> => {
  try {
    const doc = await Firestore()
      .collection(Collections.FEEDBACK)
      .doc(feedbackId)
      .get();

    if (!doc.exists) {
      return null;
    }

    const data = doc.data();
    return {
      id: doc.id,
      ...data,
      createdAt: data?.createdAt?.toDate(),
      updatedAt: data?.updatedAt?.toDate(),
    } as Feedback;
  } catch (error: any) {
    throw new Error(`Error getting feedback: ${error.message}`);
  }
};

export const subscribeToUserFeedback = (
  userId: string,
  callback: (feedback: Feedback[]) => void,
): (() => void) => {
  return Firestore()
    .collection(Collections.FEEDBACK)
    .where('userId', '==', userId)
    .orderBy('updatedAt', 'desc')
    .onSnapshot(
      snapshot => {
        const feedbackList: Feedback[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Feedback[];
        callback(feedbackList);
      },
      error => {
        console.error('Error subscribing to feedback:', error);
      },
    );
};

export const subscribeToAllFeedback = (
  callback: (feedback: Feedback[]) => void,
): (() => void) => {
  return Firestore()
    .collection(Collections.FEEDBACK)
    .orderBy('updatedAt', 'desc')
    .onSnapshot(
      snapshot => {
        const feedbackList: Feedback[] = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          createdAt: doc.data().createdAt?.toDate(),
          updatedAt: doc.data().updatedAt?.toDate(),
        })) as Feedback[];
        callback(feedbackList);
      },
      error => {
        console.error('Error subscribing to all feedback:', error);
      },
    );
};

export const subscribeToFeedbackById = (
  feedbackId: string,
  callback: (feedback: Feedback | null) => void,
): (() => void) => {
  return Firestore()
    .collection(Collections.FEEDBACK)
    .doc(feedbackId)
    .onSnapshot(
      snapshot => {
        if (snapshot.exists) {
          const data = snapshot.data();
          const feedback: Feedback = {
            id: snapshot.id,
            ...data,
            createdAt: data?.createdAt?.toDate(),
            updatedAt: data?.updatedAt?.toDate(),
          } as Feedback;
          callback(feedback);
        } else {
          callback(null);
        }
      },
      error => {
        console.error('Error subscribing to feedback:', error);
        callback(null);
      },
    );
};
