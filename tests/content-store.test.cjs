const { test } = require('node:test')
const assert = require('node:assert/strict')
const fs = require('node:fs')
const Module = require('node:module')
const path = require('node:path')
const ts = require('typescript')

test('Einreichung, Freigabe, Rückmeldung und Wiederherstellung', async () => {
  const memory = new Map()
  global.localStorage = {
    getItem: key => memory.get(key) ?? null,
    setItem: (key, value) => memory.set(key, value),
    removeItem: key => memory.delete(key),
  }
  global.window = { localStorage: global.localStorage }
  const filename = path.resolve('src/stores/content-store.ts')
  const compiled = ts.transpileModule(fs.readFileSync(filename, 'utf8'), {
    compilerOptions: { module: ts.ModuleKind.CommonJS, target: ts.ScriptTarget.ES2020 },
  }).outputText
  const mod = new Module(filename, module)
  mod.filename = filename
  mod.paths = Module._nodeModulePaths(path.dirname(filename))
  mod._compile(compiled, filename)
  const store = mod.exports.useContentStore
  const input = { front: 'Frage', back: 'Fachlich', simpleExplanation: 'Einfach',
    source: 'Lehrbuch, Ausgabe 2026', authorId: '1', deckId: 'deck-1',
    categoryId: 'cat-1', difficulty: 'beginner', tags: [] }
  store.getState().submit(input)
  const id = store.getState().cards[0].id
  assert.equal(store.getState().cards[0].status, 'pending_review')
  assert.equal(store.getState().cards.filter(c => c.status === 'approved').length, 0)
  store.getState().review(id, 'approved', 'Geprüft')
  assert.equal(store.getState().cards[0].status, 'approved')
  store.getState().review(id, 'rejected', 'Doppelte Entscheidung')
  assert.equal(store.getState().cards[0].status, 'approved')
  store.getState().submit(input)
  store.getState().review(store.getState().cards[1].id, 'rejected', 'Quelle ergänzen')
  assert.equal(store.getState().cards[1].feedback, 'Quelle ergänzen')
  const saved = memory.get('medlearn-community-v1')
  store.setState({ cards: [] })
  memory.set('medlearn-community-v1', saved)
  await store.persist.rehydrate()
  assert.equal(store.getState().cards.length, 2)
  assert.equal(store.getState().cards[0].simpleExplanation, 'Einfach')
  assert.equal(store.getState().cards[1].status, 'rejected')
})
