const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const path = require('node:path')
const Module = require('node:module')
const ts = require('typescript')
const memory = new Map()
global.window = { localStorage: { getItem: key => memory.get(key) ?? null, setItem: (key,value) => memory.set(key,value), removeItem: key => memory.delete(key) } }
const cache = new Map()
function load(file) {
  file = path.resolve(file)
  if (cache.has(file)) return cache.get(file).exports
  const mod = new Module(file, module); mod.filename = file; mod.paths = Module._nodeModulePaths(path.dirname(file)); cache.set(file, mod)
  const native = mod.require.bind(mod)
  mod.require = request => {
    const target = request.startsWith('@/') ? path.resolve('src', request.slice(2)) : request.startsWith('.') ? path.resolve(path.dirname(file), request) : null
    return target && fs.existsSync(target + '.ts') ? load(target + '.ts') : native(request)
  }
  mod._compile(ts.transpileModule(fs.readFileSync(file, 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 } }).outputText, file)
  return mod.exports
}
test('Verwaltung: Rollenprüfung, Entwurf, Veröffentlichung, Archiv und Wiederherstellung', async () => {
  const { useAppStore, mockUser } = load('src/stores/app-store.ts')
  const { useLibraryStore } = load('src/stores/library-store.ts')
  const { selectLibrary } = load('src/lib/use-library.ts')
  const library = () => useLibraryStore.getState()
  const item = { ...library().decks[0], id: 'test-deck', title: 'Testlernset', publication: 'draft' }
  assert.throws(() => library().save('decks', item), /Admin-Rolle/)
  useAppStore.getState().setCurrentUser({ ...mockUser, role: 'admin' })
  library().save('decks', item)
  assert.ok(!selectLibrary(library(), []).decks.some(d => d.id === item.id))
  library().save('decks', { ...item, publication: 'published' })
  const card = { ...library().cards[0], id: 'test-card', deckId: item.id, publication: 'published' }
  library().save('cards', card)
  assert.equal(selectLibrary(library(), []).decks.find(d => d.id === item.id).cardCount, 1)
  library().setPublication('decks', item.id, 'archived')
  assert.ok(!selectLibrary(library(), []).cards.some(c => c.id === card.id))
  library().setPublication('decks', item.id, 'draft')
  assert.ok(!selectLibrary(library(), []).decks.some(d => d.id === item.id))
  const saved = memory.get('medlearn-library-v1')
  useLibraryStore.setState({ decks: [] }); memory.set('medlearn-library-v1', saved)
  await useLibraryStore.persist.rehydrate()
  assert.equal(library().decks.find(d => d.id === item.id).publication, 'draft')
  assert.ok(selectLibrary(library(), []).cards.every(c => c.source))
  assert.ok(!selectLibrary(library(), []).documents.some(d => d.id === 'saa-bpr-2024'))
})
test('Lernfortschritt: Benutzertrennung, Rückstufung und doppelte Quiz-Auswertung', () => {
  const { useLearningStore } = load('src/stores/learning-store.ts')
  const s = () => useLearningStore.getState()
  s().recordCard('a','d','c',true); s().recordCard('a','d','c',true)
  assert.equal(s().reviews['a:c'].box, 3)
  s().recordCard('b','d','c',false)
  assert.equal(s().reviews['a:c'].box, 3)
  assert.equal(s().reviews['b:c'].box, 1)
  s().recordCard('a','d','c',false)
  assert.equal(s().reviews['a:c'].box, 1)
  const attempt = { id:'attempt', userId:'a', quizId:'q', title:'Quiz', percentage:100, passed:true }
  s().recordQuiz(attempt); s().recordQuiz(attempt)
  assert.equal(s().attempts.filter(a => a.id === 'attempt').length, 1)
})

test('Sprachansichten: Begriffe, vollständige Fassungen und gespeicherte Auswahl', async () => {
  const { splitTerms } = load('src/lib/learning-glossary.ts')
  const input = 'Aorta, HAUPTBRONCHIEN und Alveolen. Aortabogen bleibt unverändert.'
  const chunks = splitTerms(input)
  assert.equal(chunks.map(c => c.text).join(''), input)
  assert.deepEqual(chunks.filter(c => c.index !== undefined).map(c => c.text), ['Aorta', 'HAUPTBRONCHIEN', 'Alveolen'])
  const { germanStarter } = load('src/lib/db/german-starter.ts')
  assert.ok(germanStarter.quizzes.every(q => q.questions.every(q => q.simpleText && q.simpleExplanation && q.explanation)))
  assert.ok(germanStarter.documents.every(d => d.sections.every(s => s.simpleContent)))
  const { useAppStore } = load('src/stores/app-store.ts')
  useAppStore.getState().setLearningLanguage('simple')
  const saved = memory.get('medlearn-app-store')
  useAppStore.setState({ learningLanguage: 'technical' }); memory.set('medlearn-app-store', saved)
  await useAppStore.persist.rehydrate()
  assert.equal(useAppStore.getState().learningLanguage, 'simple')
})

test('Sprachmigration ergänzt Bestandsinhalte ohne eigene Texte zu überschreiben', async () => {
  const { germanStarter } = load('src/lib/db/german-starter.ts')
  const { useLibraryStore } = load('src/stores/library-store.ts')
  const legacy = JSON.parse(JSON.stringify(germanStarter))
  delete legacy.quizzes[0].questions[0].simpleText
  legacy.quizzes[0].questions[1].simpleText = 'Eigene redaktionelle Fassung'
  legacy.documents[0].sections[0].simpleContent = undefined
  legacy.documents[0].publication = 'archived'
  const migrated = await useLibraryStore.persist.getOptions().migrate(legacy, 0)
  assert.ok(migrated.quizzes[0].questions[0].simpleText)
  assert.equal(migrated.quizzes[0].questions[1].simpleText, 'Eigene redaktionelle Fassung')
  assert.ok(migrated.documents[0].sections[0].simpleContent)
  assert.equal(migrated.documents[0].publication, 'archived')
})

test('Anatomieatlas: eindeutige Strukturen, Lernfassungen und neue Inhalte bei Bestandsprofilen', async () => {
  const { anatomyModels } = load('src/lib/anatomy-data.ts')
  const { germanStarter } = load('src/lib/db/german-starter.ts')
  assert.equal(anatomyModels.length, 11)
  const parts = anatomyModels.flatMap(m => m.parts)
  assert.equal(parts.length, 43)
  assert.equal(new Set(parts.map(p => p.id)).size, parts.length)
  for (const model of anatomyModels) {
    assert.ok(['www.gesundheitsinformation.de', 'gesund.bund.de', 'www.schleswig-holstein.de'].includes(new URL(model.source).hostname))
    for (const part of model.parts) {
      assert.ok(part.path && part.technical && part.simple && part.term)
      assert.ok(part.x > 0 && part.x < 500 && part.y > 0 && part.y < 540)
      assert.ok(germanStarter.cards.some(c => c.id === 'de-' + model.id + '-' + part.id))
    }
    assert.ok(germanStarter.quizzes.find(q => q.id === 'de-quiz-' + model.id).questions.every(q => q.simpleText))
  }
  const { useLibraryStore } = load('src/stores/library-store.ts')
  const old = JSON.parse(JSON.stringify(germanStarter))
  old.decks = old.decks.slice(0,3); old.cards = old.cards.slice(0,10); old.quizzes = old.quizzes.slice(0,3)
  old.decks[0].publication = 'archived'; old.cards[0].back = 'Eigener Text'
  const migrate = useLibraryStore.persist.getOptions().migrate
  const result = await migrate(old, 2)
  assert.equal(result.decks.length,11); assert.equal(result.cards.length,43)
  assert.equal(result.decks[0].publication, 'archived'); assert.equal(result.cards[0].back, 'Eigener Text')
  const again = await migrate(result, 2)
  assert.equal(again.cards.length,43)
})
