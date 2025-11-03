'use client';

// A simple event emitter for broadcasting errors across the application.
// This is used to decouple the error source from the error handler.

type Listener<T> = (data: T) => void;

class EventEmitter<T> {
  private listeners: Set<Listener<T>> = new Set();

  on(listener: Listener<T>) {
    this.listeners.add(listener);
  }

  off(listener: Listener<T>) {
    this.listeners.delete(listener);
  }

  emit(data: T) {
    this.listeners.forEach(listener => listener(data));
  }
}

// We are only emitting FirestorePermissionError instances or other general Errors.
export const errorEmitter = new EventEmitter<Error>();