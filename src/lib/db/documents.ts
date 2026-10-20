import type { LearningDocument } from '@/lib/library-types'

export const officialDocuments: LearningDocument[] = [
  {
    id: 'saa-bpr-2024',
    title: 'SAA / BPR – Standard-Arbeitsanweisungen & Behandlungspfade',
    category: 'Bundesempfehlung Rettungsdienst',
    pages: 48,
    date: 'Ausgabe 2024/2025',
    summary:
      'Verbindliche Handlungsleitlinien für Notfallsanitäterinnen und Notfallsanitäter nach § 2a NotSanG.',
    sections: [
      {
        id: 'sec-1',
        title: '1. Allgemeine Grundsätze & Rechtliche Einordnung (§ 2a NotSanG)',
        content: `Die Ausübung heilkundlicher Tätigkeiten durch Notfallsanitäter ist in § 2a NotSanG geregelt. Voraussetzung ist, dass die Maßnahme vom Ärztlichen Leiter Rettungsdienst (ÄLRD) standardmäßig vorgegeben und überprüft ist, die Notfallsanitäterin oder der Notfallsanitäter diese Maßnahme in der Ausbildung erlernt hat und beherrscht, und die Maßnahme zur Abwendung von Lebensgefahr oder schweren gesundheitlichen Schäden erforderlich ist, bis eine ärztliche Versorgung möglich ist.`,
      },
      {
        id: 'sec-2',
        title: '2. Akutes Koronarsyndrom (ACS) & NSTEMI / STEMI',
        content: `Diagnostik: 12-Kanal-EKG innerhalb von 10 Minuten nach Erstkontakt. Monitoring (RR, SpO2, EKG). Bei STEMI sofortige Anmeldung im nächsten PCI-Zentrum mit Herzkatheterlabor.
Medikamentöse Basismaßnahmen nach SAA:
- Acetylsalicylsäure (ASS): 150 - 300 mg i.v. / oral (bei fehlender Kontraindikation)
- Heparin: 4.000 - 5.000 I.E. i.v. Bolus
- Sauerstoffgabe nur bei SpO2 < 90% (Zielwert 92 - 96%)
- Nitrospray: 1-2 Hübe sublingual (Kontraindikation: RR systolisch < 90 mmHg, Rechtsherzinfarkt, PDE-5-Hemmer).`,
      },
      {
        id: 'sec-3',
        title: '3. Anaphylaxie (Schweregrad II - IV)',
        content: `Das Mittel der ersten Wahl bei manifester Anaphylaxie mit respiratorischer oder kardiovaskulärer Beteiligung ist ADRENALIN intramuskulär (i.m.) in den M. vastus lateralis (Oberschenkel-Außenseite).
Dosierung Adrenalin i.m.:
- Erwachsene: 0,5 mg unverdünnt (1:1.000)
- Kinder > 12 Jahre: 0,5 mg i.m.
- Kinder 6 - 12 Jahre: 0,3 mg i.m.
- Kinder < 6 Jahre: 0,15 mg i.m.
Flüssigkeitsgabe: Rasche Infusion kristalloider Vollelektrolytlösung (VEL).
Zweitrangig: H1-Antihistaminikum (z.B. Dimetinden/Clemastin) und Glukokortikoid (z.B. Prednisolon 100-250 mg i.v.).`,
      },
      {
        id: 'sec-4',
        title: '4. Schweres Schädel-Hirn-Trauma (SHT) & ICP-Management',
        content: `Ziele im Rettungsdienst: Vermeidung sekundärer Hirnschäden durch Hypoxie (paO2 < 60 mmHg) und arterielle Hypotension (RR systolisch < 90-100 mmHg).
Maßnahmen:
- Oberkörperhochlagerung 30° (bei intakter HWS bzw. adäquater Achsenstabilisierung)
- Normoventilation anstreben (etCO2 35-40 mmHg), keine routinemäßige Hyperventilation!
- Bei Einklemmungszeichen (Pupillendifferenz, Strecksynergismen): Osmotherapie erwägen, Notarzt-Nachforderung und Voranmeldung im neurochirurgischen Traumazentrum.`,
      },
    ],
  },
  {
    id: 'erc-resuscitation',
    title: 'ERC Reanimationsleitlinien (Erwachsene & Pädiatrie)',
    category: 'Leitlinie ERC / GRC',
    pages: 32,
    date: 'Version 2025',
    summary:
      'Aktuelle Empfehlungen des European Resuscitation Council zu BLS, ALS und Post-Reanimationsbehandlung.',
    sections: [
      {
        id: 'erc-1',
        title: 'Advanced Life Support (ALS) Algorithmus',
        content: `Minimierung von Unterbrechungen der Thoraxkompression (Hands-off-Zeit < 5 Sekunden).
Rhythmusanalyse alle 2 Minuten.
Defibrillierbare Rhythmen (VF / pVT):
- 1. Schock (150-200 J biphasisch) -> Sofort 2 Min CPR
- 2. Schock -> 2 Min CPR
- 3. Schock -> Adrenalin 1 mg i.v./i.o. und Amiodaron 300 mg i.v./i.o.
- 5. Schock -> Amiodaron 150 mg i.v./i.o.
Nicht defibrillierbare Rhythmen (Asystolie / PEA):
- Adrenalin 1 mg i.v./i.o. so früh wie möglich, dann alle 3-5 Minuten
- Umkehrbare Ursachen suchen: 4 H's (Hypoxie, Hypovolämie, Hypo-/Hyperkaliämie/metabolisch, Hypothermie) und 4 HITS (Herzbeuteltamponade, Intoxikation, Thrombose/Lungenembolie, Spannungspneumothorax).`,
      },
    ],
  },
]

