export interface Lesson {
  id: string
  title: string
  question: string
  technical: string
  simple: string
  correct: string
  wrong: [string, string]
  sources: string[]
}
export function lesson(id:string,title:string,question:string,technical:string,simple:string,correct:string,wrong:[string,string],...sources:string[]):Lesson {
  return {id,title,question,technical,simple,correct,wrong,sources}
}
export const checkedAt='2026-10-20'
export const iq=(slug:string)=>`https://www.gesundheitsinformation.de/${slug}.html`
export const bund=(slug:string)=>`https://gesund.bund.de/${slug}`
export const law=(book:string,section:string)=>`https://www.gesetze-im-internet.de/${book}/__${section}.html`
export const safe=(section:string,slug:string)=>`https://www.sicherer-rettungsdienst.de/rettungswache/${section}/${slug}`
