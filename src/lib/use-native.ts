'use client'
import { useSyncExternalStore } from 'react'
import { Capacitor } from '@capacitor/core'
const subscribe=()=>()=>{}
export function useNative(){return useSyncExternalStore(subscribe,()=>Capacitor.isNativePlatform(),()=>false)}
