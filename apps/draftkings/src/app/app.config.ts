import {
  ApplicationConfig,
  provideBrowserGlobalErrorListeners,
  provideZoneChangeDetection,
} from '@angular/core';
import { provideRouter } from '@angular/router';
import { initializeApp, provideFirebaseApp } from '@angular/fire/app';
import { getAuth, provideAuth } from '@angular/fire/auth';
import { getFirestore, provideFirestore } from '@angular/fire/firestore';
import { appRoutes } from './app.routes';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(appRoutes),
    // TODO: Should provideFirebaseApp initializeApp properties be moved to angular.json?
    provideFirebaseApp(() =>
      initializeApp({
        apiKey: 'AIzaSyCVhnorDFGTiFrlMAiedPKDJpGuPL90Ats',
        appId: '1:1010198527075:web:376bf03e9dddcb03444c56',
        authDomain: 'dfs-lineup-builder.firebaseapp.com',
        measurementId: 'G-QCHX9TXCJ5',
        messagingSenderId: '1010198527075',
        projectId: 'dfs-lineup-builder',
        storageBucket: 'dfs-lineup-builder.firebasestorage.app',
        // projectNumber: '1010198527075',
        // version: '2',
      })
    ),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()),
  ],
};
