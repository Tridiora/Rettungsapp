import type { Library } from '@/lib/library-types'
import { categories } from '@/lib/db/mock-data'
import data from './beta/generated.json'
export const expandedTopics = Object.entries(data).map(([key, facts], index) => ({key, category:categories[index], facts}))
const date=new Date('2026-10-21T12:00:00+02:00')
export const expandedLibrary: Library = {decks:[],cards:[],quizzes:[],documents:[]}
for(const {category,facts} of expandedTopics){
 const deckId=`de-basis-${category.slug}`
 for(const f of facts){
  expandedLibrary.cards.push({id:`beta-${f.id}`,deckId,categoryId:category.id,category,front:f.question,back:`${f.answer}.\n\n${f.context}`,simpleExplanation:`${f.answer}.\n\n${f.context}`,hint:f.title,explanationImageUrl:`/erklaerbilder/${f.id}.svg`,yearLevel:f.year as 1|2|3,difficulty:f.year===1?'beginner':f.year===2?'intermediate':'advanced',authorId:'redaktion',status:'approved',tags:[f.title,`${f.year}. Lehrjahr`],source:f.source,publication:'published',createdAt:date,updatedAt:date})
 }
}
export function expandedQuestions(categoryId:string,quizId:string){
 const topic=expandedTopics.find(t=>t.category.id===categoryId)
 return (topic?.facts||[]).map((f,index)=>{
 const id=`${quizId}-${f.id}`,choices=[{text:f.answer,isCorrect:true},...f.wrong.map(text=>({text,isCorrect:false}))],shift=index%3,ordered=[...choices.slice(shift),...choices.slice(0,shift)]
 return {id,quizId,type:'single_choice' as const,text:f.question,simpleText:f.question,yearLevel:f.year as 1|2|3,explanation:`${f.answer}. ${f.context}`,simpleExplanation:`${f.answer}. ${f.context}`,explanationImageUrl:`/erklaerbilder/${f.id}.svg`,source:f.source,points:1,order:index,answers:ordered.map((a,i)=>({...a,id:`${id}-a${i}`,questionId:id,order:i}))}
 })
}
