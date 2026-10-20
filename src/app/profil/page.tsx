'use client'
import { useState } from 'react'
import { useAppStore } from '@/stores/app-store'
export default function Profile() {
  const { currentUser, setCurrentUser } = useAppStore()
  const [name, setName] = useState(currentUser?.name || '')
  const [email, setEmail] = useState(currentUser?.email || '')
  const [saved, setSaved] = useState(false)
  return <div className="max-w-2xl mx-auto p-6 space-y-5"><h1 className="text-3xl font-bold">Mein Profil</h1><p className="text-muted">Lokales Lernprofil · Deutschland. Diese Angaben werden ausschließlich in diesem Browser gespeichert.</p><form onSubmit={e => { e.preventDefault(); if (currentUser && name.trim()) { setCurrentUser({ ...currentUser, name: name.trim(), email }); setSaved(true) } }} className="rounded-2xl border border-border bg-surface p-6 space-y-5"><label className="block">Name<input required value={name} onChange={e => { setName(e.target.value); setSaved(false) }} className="block w-full mt-2 bg-background border border-border p-3 rounded-xl" /></label><label className="block">E-Mail-Adresse<input required type="email" value={email} onChange={e => { setEmail(e.target.value); setSaved(false) }} className="block w-full mt-2 bg-background border border-border p-3 rounded-xl" /></label><button className="bg-accent text-white rounded-xl px-5 py-3">Profil speichern</button>{saved && <p role="status" className="text-accent-ink">Profil gespeichert.</p>}</form></div>
}
