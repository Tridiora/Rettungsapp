'use client'
import { create } from 'zustand'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { EditorialRecord } from '@/lib/editorial-types'
export const useEditorialStore=create<{records:EditorialRecord[]|null;error:string;refresh:()=>Promise<void>}>((set)=>({
  records:null,error:'',
  refresh:async()=>{try{const response=await fetch('/api/editorial');if(!response.ok)throw Error('Lerninhalte konnten nicht geladen werden.');const data=await response.json();set({records:data.records,error:''})}catch(e){set({records:[],error:(e as Error).message})}},
}))
export function EditorialSync(){const pathname=usePathname();useEffect(()=>{const refresh=()=>{void useEditorialStore.getState().refresh()};refresh();const timer=window.setInterval(()=>{if(document.visibilityState==='visible')refresh()},30000);window.addEventListener('medlearn-content-changed',refresh);window.addEventListener('focus',refresh);return()=>{window.clearInterval(timer);window.removeEventListener('medlearn-content-changed',refresh);window.removeEventListener('focus',refresh)}},[pathname]);return null}
