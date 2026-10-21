import {expandedLibrary, expandedQuestions, expandedTopics} from './expanded'
import {categories} from '@/lib/db/mock-data'
import type {Library} from '@/lib/library-types'
import {anatomyLessons} from './anatomy'
import {emergencyLessons} from './emergency'
import {pharmaLessons} from './pharma'
import {tacticsLessons} from './tactics'
import {legalLessons} from './legal'
import {hygieneLessons} from './hygiene'
import {communicationLessons} from './communication'
import {pediatricLessons} from './pediatrics'
import {checkedAt} from './schema'
export const curriculumTopics=[
 {category:categories[0],lessons:anatomyLessons,focus:[0,2,4,8]},
 {category:categories[1],lessons:emergencyLessons,focus:[0,1,2,7]},
 {category:categories[2],lessons:pharmaLessons,focus:[0,1,6,7]},
 {category:categories[3],lessons:tacticsLessons,focus:[0,1,6,7]},
 {category:categories[4],lessons:legalLessons,focus:[0,1,4,5]},
 {category:categories[5],lessons:hygieneLessons,focus:[0,1,3,4]},
 {category:categories[6],lessons:communicationLessons,focus:[0,1,5,7]},
 {category:categories[7],lessons:pediatricLessons,focus:[0,2,3,5]},
]
const resources:Record<string,{title:string;url:string;kind:string}[]>={
 'cat-1':[{title:'Anatomie des Herzens – deutscher Erklärfilm von ZDF/3sat (CC BY 4.0; Urheberangaben unter Anatomie)',url:'/anatomie/herz.webm',kind:'video'},{title:'Urheber- und Lizenzangaben zum Herzfilm',url:'/anatomie/QUELLEN.md',kind:'source'}],
 'cat-2':[{title:'GRC: Video zur Überlebenskette und deutsche Leitlinien 2025',url:'https://www.grc-org.de/wissenschaft/leitlinien',kind:'video-external'},{title:'gesund.bund.de: Erklärvideo zum Schlaganfall',url:'https://gesund.bund.de/schlaganfall',kind:'video-external'}],
 'cat-3':[{title:'IQWiG: Medikamentenliste zum Ausfüllen (Original-PDF)',url:'https://www.gesundheitsinformation.de/pdf/medikamentenliste/medikamentenliste.pdf',kind:'pdf'}],
 'cat-4':[{title:'Unfallkasse NRW und BGW: Mediathek Sicherer Rettungsdienst',url:'https://mediathek.sicherer-rettungsdienst.de/',kind:'source'}],
 'cat-5':[{title:'gesund.bund.de: Video zur Patientenverfügung',url:'https://gesund.bund.de/wege-im-gesundheitswesen/erwachsenenleben/alter/patientenverfuegung-und-co/patientenverfuegung',kind:'video-external'}],
 'cat-6':[{title:'RKI: Händehygiene – Empfehlungen und Original-Unterlagen',url:'https://www.rki.de/DE/Themen/Infektionskrankheiten/Krankenhaushygiene/KRINKO/Empfehlungen-der-KRINKO/Basishygiene/Tabelle_Haendehyg_Rili.html',kind:'source'}],
 'cat-7':[{title:'Deutsche Alzheimer Gesellschaft: 11 Tipps zur Verständigung (Original-PDF)',url:'https://www.deutsche-alzheimer.de/fileadmin/Alz/pdf/Flyer_und_Dokumente/11_Tipps_zur_besseren_Verstaendigung.pdf',kind:'pdf'}],
 'cat-8':[{title:'Bundesinstitut für Risikobewertung: Erklärvideo zu Knopfzellen',url:'https://www.bfr.bund.de/presse/mediathek/video/knopfzellen-batterien/',kind:'video-external'}],
}
const date=new Date('2026-10-20T12:00:00+02:00')
export const curriculumLibrary:Library={decks:[],cards:[],quizzes:[],documents:[]}
for(const topic of curriculumTopics){
 const {category,lessons}=topic,id=`de-basis-${category.slug}`
 const urls=[...new Set(lessons.flatMap(l=>l.sources))]
 const source=`Quellenabgleich ${checkedAt} · Deutschland · ${urls.join(' · ')}`
 curriculumLibrary.decks.push({id,title:`${category.name} – großer Lernpool`,description:'Über 100 Lernkarten mit Quellen, Lehrjahrzuordnung und Erklärgrafiken.',categoryId:category.id,category,coverImage:`/lernmaterial/${category.slug}.svg`,authorId:'redaktion',isOfficial:true,cardCount:lessons.length,difficulty:'beginner',tags:['Deutschland','Grundlagen','Quellenabgleich 20.10.2026'],createdAt:date,updatedAt:date,source,publication:'published'})
 for(const l of lessons)curriculumLibrary.cards.push({id:`${id}-${l.id}`,front:l.question,back:l.technical,simpleExplanation:l.simple,hint:l.title,deckId:id,categoryId:category.id,category,authorId:'redaktion',status:'approved',difficulty:'beginner',tags:['Deutschland',l.title],createdAt:date,updatedAt:date,source:`Quellenabgleich ${checkedAt} · ${l.sources.join(' · ')}`,publication:'published'})
 const quizId=`${id}-quiz`
 curriculumLibrary.quizzes.push({id:quizId,title:`${category.name} – Verständnis prüfen`,description:'Großer Fragenpool: wahlweise 20, 40 oder alle Fragen mit begründeter Auflösung und Erklärgrafiken.',categoryId:category.id,category,authorId:'redaktion',difficulty:'beginner',passingScore:80,isExamSimulation:false,createdAt:date,source,publication:'published',questions:lessons.map((l,index)=>{
  const questionId=`${quizId}-${l.id}`
  // Rotate the correct position deterministically: it is not always the first answer.
  const answers=[{text:l.correct,isCorrect:true},...l.wrong.map(text=>({text,isCorrect:false}))]
  const shift=index%answers.length,ordered=[...answers.slice(shift),...answers.slice(0,shift)]
  return {id:questionId,quizId,type:'single_choice',text:l.question,simpleText:l.question,explanation:l.technical,simpleExplanation:l.simple,source:l.sources.join(' · '),points:1,order:index,answers:ordered.map((a,i)=>({...a,id:`${questionId}-${i}`,questionId,order:i}))}
 })})
 curriculumLibrary.documents.push({id:`${id}-lesen`,title:`${category.name} – Lernkapitel`,category:category.name,pages:lessons.length,date:'Quellenabgleich 20.10.2026',summary:'Zehn erläuterte Lernziele, eine interaktive Themenübersicht und weiterführende Originalquellen. Grundlagen für Deutschland; keine vollständige Einsatzanweisung.',imageUrl:`/lernmaterial/${category.slug}.svg`,visualSteps:topic.focus.map(i=>({title:lessons[i].title,technical:lessons[i].technical,simple:lessons[i].simple})),resources:resources[category.id],publication:'published',source,sections:lessons.map((l,i)=>({id:`${id}-abschnitt-${l.id}`,title:`${i+1}. ${l.title}`,content:l.technical,simpleContent:l.simple,sources:l.sources}))})
}

for(const deck of curriculumLibrary.decks) {
 const extra=expandedLibrary.cards.filter(c=>c.deckId===deck.id);
 deck.cardCount+=extra.length;
 deck.tags.push('1. Lehrjahr','2. Lehrjahr','3. Lehrjahr');
}
for(const card of curriculumLibrary.cards) card.yearLevel=1;
for(const quiz of curriculumLibrary.quizzes) {
 for(const q of quiz.questions){q.yearLevel=1;q.explanationImageUrl=`/erklaerbilder/basis-${q.id}.svg`}
 quiz.questions.push(...expandedQuestions(quiz.categoryId,quiz.id));
}

for(const card of curriculumLibrary.cards) {
 const quiz=curriculumLibrary.quizzes.find(q=>q.categoryId===card.categoryId);
 const question=quiz?.questions.find(q=>q.text===card.front);
 card.explanationImageUrl=question?.explanationImageUrl;
}

for(const document of curriculumLibrary.documents){
 const topic=expandedTopics.find(t=>document.id===`de-basis-${t.category.slug}-lesen`);
 if(!topic)continue;
 for(const section of document.sections)section.yearLevel=1;
 document.sections.push(...topic.facts.map(f=>({id:`beta-section-${f.id}`,title:f.question,content:`${f.answer}. ${f.context}`,simpleContent:`${f.answer}. ${f.context}`,sources:[f.source],yearLevel:f.year as 1|2|3})));
 document.pages=document.sections.length;
 document.summary='Lernziele, Fragen und Erklärungen aus dem erweiterten Themenpool. Lehrjahre sind didaktische Empfehlungen, kein verbindlicher Landeslehrplan.';
}
