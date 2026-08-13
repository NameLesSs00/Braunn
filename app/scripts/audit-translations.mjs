import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

const appRoot = path.resolve(process.cwd())
const srcRoot = path.join(appRoot, 'src')

const localeFiles = [
  'pages/HRMPages/locales/de.ts',
  'pages/laundry/locales/de.ts',
  'pages/maintenance/locales/de.ts',
  'pages/PMSPages/locales/de.ts',
  'pages/POSPages/restaurant/locales/de.ts',
  'pages/systems/locales/de.ts',
]

const translatableAttributes = new Set(['placeholder', 'aria-label', 'title', 'alt', 'label'])
const translatableProps = new Set([
  'label',
  'title',
  'subtitle',
  'name',
  'description',
  'status',
  'category',
  'type',
  'message',
  'text',
  'placeholder',
  'helperText',
  'emptyMessage',
])

const ignoredStringPatterns = [
  /^$/,
  /^[-+]?\d+(\.\d+)?$/,
  /^#[0-9a-f]{3,8}$/i,
  /^https?:/i,
  /^\//,
  /\.(png|svg|jpg|jpeg|gif|webp|mp3|ico)$/i,
  /^text-/,
  /^bg-/,
  /^border-/,
  /^ring-/,
  /^shadow-/,
  /^grid-/,
  /^flex-/,
  /^[A-Z0-9_./:-]+$/,
]

const ignoredExactStrings = new Set([
  'id',
  'div',
  'span',
  'button',
  'select',
  'checkbox',
  'number',
  'email',
  'password',
  'date',
  'text',
  'idle',
  'loading',
  'error',
  'success',
  'spring',
  'breadcrumb',
])

function normalize(value) {
  return value.replace(/\s+/g, ' ').trim()
}

function shouldIgnore(value) {
  if (!value || value.length < 2) return true
  if (!/[A-Za-z]/.test(value)) return true
  if (ignoredExactStrings.has(value)) return true
  return ignoredStringPatterns.some((pattern) => pattern.test(value))
}

function readDictionaryKeys() {
  const keys = new Set()
  const originalKeys = new Set()

  for (const relativeFile of localeFiles) {
    const filePath = path.join(srcRoot, relativeFile)
    const content = fs.readFileSync(filePath, 'utf8')
    const keyPattern = /(['"`])((?:\\.|(?!\1)[\s\S])*)\1\s*:/g
    let match

    while ((match = keyPattern.exec(content))) {
      originalKeys.add(match[2])
      keys.add(match[2])
      keys.add(match[2].toLowerCase())
    }
  }

  return { keys, originalKeys }
}

function walk(directory, files = []) {
  for (const entry of fs.readdirSync(directory, { withFileTypes: true })) {
    const entryPath = path.join(directory, entry.name)
    if (entry.isDirectory()) {
      walk(entryPath, files)
      continue
    }

    if (!/\.(tsx|ts)$/.test(entry.name)) continue
    if (/locales[\\/]+de\.ts$/.test(entryPath)) continue
    if (/i18next\.d\.ts$/.test(entryPath)) continue
    files.push(entryPath)
  }

  return files
}

function moduleName(location) {
  const normalized = location.replace(/\\/g, '/')

  if (normalized.startsWith('pages/salesRevenue')) return 'salesRevenue'
  if (normalized.startsWith('pages/HKPages') || normalized.startsWith('pages/housekeeping')) return 'housekeeping'
  if (normalized.startsWith('pages/reports')) return 'reports'
  if (normalized.startsWith('pages/reservations') || normalized.startsWith('widgets/reservations')) return 'reservations'
  if (normalized.startsWith('pages/roomPlan')) return 'roomPlan'
  if (normalized.startsWith('pages/HRMPages')) return 'hrm'
  if (normalized.startsWith('pages/laundry')) return 'laundry'
  if (normalized.startsWith('pages/maintenance')) return 'maintenance'

  return normalized.split('/')[0]
}

function lineNumber(sourceFile, node) {
  return sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1
}

function collectCandidates() {
  const candidates = new Map()

  function add(value, filePath, line, kind) {
    const normalized = normalize(value)
    if (shouldIgnore(normalized)) return

    if (!candidates.has(normalized)) {
      candidates.set(normalized, { count: 0, kind, locations: [] })
    }

    const candidate = candidates.get(normalized)
    candidate.count += 1

    if (candidate.locations.length < 5) {
      candidate.locations.push(`${path.relative(srcRoot, filePath)}:${line}`)
    }
  }

  for (const filePath of walk(srcRoot)) {
    const content = fs.readFileSync(filePath, 'utf8')
    const sourceFile = ts.createSourceFile(
      filePath,
      content,
      ts.ScriptTarget.Latest,
      true,
      filePath.endsWith('.tsx') ? ts.ScriptKind.TSX : ts.ScriptKind.TS,
    )

    function visit(node) {
      if (ts.isJsxText(node)) {
        add(node.getText(sourceFile), filePath, lineNumber(sourceFile, node), 'jsxText')
      }

      if (ts.isJsxAttribute(node) && node.initializer) {
        const attributeName = node.name.getText(sourceFile)
        if (translatableAttributes.has(attributeName) && ts.isStringLiteral(node.initializer)) {
          add(node.initializer.text, filePath, lineNumber(sourceFile, node), `attr:${attributeName}`)
        }
      }

      if (ts.isPropertyAssignment(node) && ts.isIdentifier(node.name) && translatableProps.has(node.name.text)) {
        const initializer = node.initializer
        if (ts.isStringLiteral(initializer) || ts.isNoSubstitutionTemplateLiteral(initializer)) {
          add(initializer.text, filePath, lineNumber(sourceFile, node), `prop:${node.name.text}`)
        }
      }

      if (ts.isCallExpression(node)) {
        const expression = node.expression.getText(sourceFile)
        if (/(alert|toast|notify|setError|setSuccess|confirm|showError|showSuccess)/i.test(expression)) {
          for (const argument of node.arguments) {
            if (ts.isStringLiteral(argument) || ts.isNoSubstitutionTemplateLiteral(argument)) {
              add(argument.text, filePath, lineNumber(sourceFile, argument), 'call')
            }
          }
        }
      }

      ts.forEachChild(node, visit)
    }

    visit(sourceFile)
  }

  return candidates
}

const { keys: dictionaryKeys, originalKeys } = readDictionaryKeys()
const candidates = collectCandidates()
const missing = [...candidates.entries()]
  .filter(([value]) => !dictionaryKeys.has(value) && !dictionaryKeys.has(value.toLowerCase()))
  .sort((a, b) => b[1].count - a[1].count || a[0].localeCompare(b[0]))

const missingByModule = {}
for (const [, candidate] of missing) {
  for (const module of new Set(candidate.locations.map(moduleName))) {
    missingByModule[module] = (missingByModule[module] ?? 0) + 1
  }
}

console.log(`Dictionary keys: ${originalKeys.size}`)
console.log(`Candidate UI strings: ${candidates.size}`)
console.log(`Missing exact German keys: ${missing.length}`)
console.log('')
console.log('Missing by module:')
for (const [module, count] of Object.entries(missingByModule).sort((a, b) => b[1] - a[1])) {
  console.log(`- ${module}: ${count}`)
}

console.log('')
console.log('Top missing samples:')
for (const [value, candidate] of missing.slice(0, 80)) {
  console.log(`- ${value} [${candidate.count}] ${candidate.locations.join(', ')}`)
}

if (missing.length > 0 && process.argv.includes('--fail-on-missing')) {
  process.exitCode = 1
}
