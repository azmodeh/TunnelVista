'use client';

import { useMemo } from 'react';
import { useDevices } from '@/components/devices/use-devices';

/**
 * A hook to validate a pair of source and destination devices.
 * @param sourceId The ID of the source device.
 * @param destinationId The ID of the destination device.
 * @returns An object containing `isValid` boolean and an array of `errors`.
 */
export function useDeviceValidation(sourceId: string | null, destinationId: string | null) {
  const { data: devicesData } = useDevices();
  const devices = devicesData?.devices || [];

  const validationResult = useMemo(() => {
    const errors: string[] = [];
    
    if (!sourceId) {
      // Don't show errors if nothing is selected yet
      return { isValid: false, errors: [] };
    }

    const sourceDevice = devices.find(d => d.id === sourceId);
    if (!sourceDevice) {
      errors.push('Source device not found.');
    } else if (sourceDevice.status !== 'online') {
      errors.push('Source device must be online.');
    }

    if (destinationId) {
      const destinationDevice = devices.find(d => d.id === destinationId);
       if (!destinationDevice) {
        errors.push('Destination device not found.');
      } else if (destinationDevice.status !== 'online') {
        errors.push('Destination device must be online.');
      }
      if (sourceId === destinationId) {
        errors.push('Source and Destination cannot be the same device.');
      }
    }

    return {
      isValid: errors.length === 0 && !!sourceId && !!destinationId,
      errors: errors,
    };
  }, [sourceId, destinationId, devices]);

  return validationResult;
}
