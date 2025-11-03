'use client';

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { AuditLog } from '@/lib/types';
import { useUser } from '@/firebase/auth/use-user';
import { collection, onSnapshot, addDoc, serverTimestamp, query, orderBy } from 'firebase/firestore';
import { getFirebaseFirestore } from '@/firebase';
import { useState, useEffect } from 'react';
import { errorEmitter } from '@/firebase/error-emitter';
import { FirestorePermissionError, type SecurityRuleContext } from '@/firebase/errors';


// React Query Hook to get audit logs
export const useAuditLogs = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    const firestore = getFirebaseFirestore();
    if (!firestore) return;

    const auditLogsCollection = collection(firestore, 'audit_logs');
    const q = query(auditLogsCollection, orderBy('timestamp', 'desc'));
    
    const unsubscribe = onSnapshot(q,
      (snapshot) => {
        const logs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as AuditLog));
        setAuditLogs(logs);
        setLoading(false);
      },
      async (err) => {
        const permissionError = new FirestorePermissionError({ path: 'audit_logs', operation: 'list' });
        errorEmitter.emit('permission-error', permissionError);
        console.error("Failed to fetch audit logs:", err);
        setError(err);
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  return { data: auditLogs, isLoading: loading, isError: !!error };
};

// Hook that returns a function to add an audit log
export const useAddAuditLog = () => {
  const { user } = useUser();

  const addLog = (logData: Omit<AuditLog, 'id' | 'timestamp' | 'userId' | 'userEmail'>) => {
    
    if (!user) {
      console.log("Audit log not added: user not authenticated.");
      return;
    }

    const logToAdd = {
      ...logData,
      userId: user.uid || 'unknown',
      userEmail: user.email || 'N/A',
      timestamp: serverTimestamp(),
    };
    
    const firestore = getFirebaseFirestore();
    const auditLogsCollection = collection(firestore, 'audit_logs');
    addDoc(auditLogsCollection, logToAdd).catch(async (serverError) => {
        const permissionError = new FirestorePermissionError({
          path: auditLogsCollection.path,
          operation: 'create',
          requestResourceData: logToAdd,
        });
        errorEmitter.emit('permission-error', permissionError);
    });
  };

  return addLog;
};