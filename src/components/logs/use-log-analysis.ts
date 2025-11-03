'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { LogAnalysis } from '@/lib/types';
import { useToast } from '@/hooks/use-toast';
import { collection, onSnapshot, addDoc, serverTimestamp } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase';
import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError } from '@/firebase/errors';

export const useLogAnalyses = () => {
    const [logAnalyses, setLogAnalyses] = useState<LogAnalysis[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<Error | null>(null);

    useEffect(() => {
        const firestore = getFirebaseFirestore();
        if (!firestore) return;

        const logAnalysisCollection = collection(firestore, 'log_analysis');
        const unsubscribe = onSnapshot(logAnalysisCollection, 
            (snapshot) => {
                const analyses = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as LogAnalysis)).sort((a, b) => {
                    const dateA = a.timestamp ? a.timestamp.toDate().getTime() : Date.now();
                    const dateB = b.timestamp ? b.timestamp.toDate().getTime() : Date.now();
                    return dateB - dateA;
                });
                setLogAnalyses(analyses);
                setLoading(false);
            }, 
            async (err) => {
                const permissionError = new FirestorePermissionError({ path: logAnalysisCollection.path, operation: 'list' });
                errorEmitter.emit('permission-error', permissionError);
                console.error("Failed to fetch log analyses:", err);
                setError(err);
                setLoading(false);
            }
        );

        return () => unsubscribe();
    }, []);

    return { data: logAnalyses, isLoading: loading, isError: !!error };
}


export const useAddLogAnalysis = () => {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (
      newAnalysis: Omit<LogAnalysis, 'id' | 'timestamp' | 'deviceId'> & { deviceId?: string }
    ) => {
      const firestore = getFirebaseFirestore();
      const analysisData = {
        ...newAnalysis,
        deviceId: newAnalysis.deviceId || 'general',
        timestamp: serverTimestamp(),
      };
      
      const logAnalysisCollection = collection(firestore, 'log_analysis');
      addDoc(logAnalysisCollection, analysisData)
        .catch(async (serverError) => {
            const permissionError = new FirestorePermissionError({
              path: logAnalysisCollection.path,
              operation: 'create',
              requestResourceData: analysisData,
            });
            errorEmitter.emit('permission-error', permissionError);
            throw serverError; // re-throw to allow mutation to enter onError state
        });
      
      const docRef = await addDoc(logAnalysisCollection, analysisData);
      return { ...analysisData, id: docRef.id };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['log_analysis'] });
      toast({
        title: 'Analysis Saved',
        description: 'The log analysis report has been saved to your history.',
      });
    },
    onError: (error) => {
      toast({
        variant: 'destructive',
        title: 'Error',
        description: 'Failed to save analysis report.',
      });
    },
  });
};