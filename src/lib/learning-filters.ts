import type {Quiz,YearLevel} from '@/types'
export function questionsForYear(quiz:Quiz,year:YearLevel){return quiz.questions.filter(q=>year==='all'||(q.yearLevel||quiz.yearLevel||1)===year)}
export function matchesYear(item:{yearLevel?:YearLevel},year:YearLevel){return year==='all'||(item.yearLevel||1)===year}
