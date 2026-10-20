'use client'
import { apiJson } from '@/lib/api-client'
import { create } from 'zustand'
import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import type { EditorialRecord } from '@/lib/editorial-types'
let requestId=0
export const useEditorialStore=create<{records:EditorialRecord[]|null;error:string;reset:()=>void;refresh:()=>Promise<void>}>((set)=>({
  records:null,error:'',
  reset:()=>{requestId++;set({records:null,error:''})},
  refresh:async()=>{const id=++requestId;try{const data=await apiJson<{records:EditorialRecord[]}>('/api/editorial');if(id===requestId)set({records:data.records,error:''})}catch(e){if(id===requestId)set({error:(e as Error).message})}},
}))
export function EditorialSync(){const pathname=usePathname();useEffect(()=>{const refresh=()=>{void useEditorialStore.getState().refresh()};refresh();const timer=window.setInterval(()=>{if(document.visibilityState==='visible')refresh()},30000);window.addEventListener('medlearn-content-changed',refresh);window.addEventListener('focus',refresh);return()=>{window.clearInterval(timer);window.removeEventListener('medlearn-content-changed',refresh);window.removeEventListener('focus',refresh)}},[pathname]);return null}
