'use client';

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import QrReader from 'react-qr-scanner';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription, SheetFooter } from '@/components/ui/sheet';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '../ui/alert';
import { AlertCircle, Video } from 'lucide-react';

interface QRScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScan: (data: string | null) => void;
}

const QRScannerModal: React.FC<QRScannerModalProps> = ({ isOpen, onClose, onScan }) => {
  const { toast } = useToast();
  const [hasCameraPermission, setHasCameraPermission] = useState(true);

  const handleScan = (result: any) => {
    if (result) {
      onScan(result.text);
    }
  };

  const handleError = (err: any) => {
    console.error(err);
    setHasCameraPermission(false);
    toast({
      variant: 'destructive',
      title: 'Camera Error',
      description: err.message || 'Could not access the camera. Please check permissions.',
    });
    onClose();
  };

  return (
    <Sheet open={isOpen} onOpenChange={onClose}>
        <SheetContent>
            <SheetHeader>
                <SheetTitle>Scan VPN Configuration</SheetTitle>
                <SheetDescription>
                    Point your camera at a QR code (e.g., from WireGuard) to automatically configure a tunnel.
                </SheetDescription>
            </SheetHeader>
            <div className="py-4">
                {hasCameraPermission ? (
                     <div className="rounded-lg overflow-hidden border">
                        <QrReader
                            delay={300}
                            onError={handleError}
                            onScan={handleScan}
                            style={{ width: '100%' }}
                            onResult={handleScan}
                            constraints={{ video: { facingMode: 'environment' } }}
                        />
                     </div>
                ) : (
                    <Alert variant="destructive">
                        <AlertCircle className="h-4 w-4" />
                        <AlertTitle>Camera Access Denied</AlertTitle>
                        <AlertDescription>
                            Please enable camera permissions in your browser settings to use this feature.
                        </AlertDescription>
                    </Alert>
                )}
            </div>
            <SheetFooter>
                <Button variant="outline" onClick={onClose}>Cancel</Button>
            </SheetFooter>
        </SheetContent>
    </Sheet>
  );
};

export default QRScannerModal;
