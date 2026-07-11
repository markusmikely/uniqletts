/* ============================================================
   IMPORT — upload extracted uniqletts.com content to Sanity
   ------------------------------------------------------------
   Usage:  node scripts/import-content.mjs [--dry-run] [--skip-images]

   - Reads legacy data from scripts/data/*.json
   - Downloads property photos from the legacy Sanity CDN and
     re-uploads them to the new project (cached in
     scripts/data/.image-map.json so re-runs are cheap)
   - createOrReplace with deterministic _ids → fully idempotent
   ============================================================ */

import { createClient } from '@sanity/client'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'
import {
  mapProperty,
  mapReview,
  assignSlugs,
  buildLegalPage,
  buildHomepageSettings,
  buildSiteSettings,
  legacyImageUrl,
  normalisePostcode,
} from './transform.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DATA_DIR = path.join(__dirname, 'data')
const IMAGE_MAP_PATH = path.join(DATA_DIR, '.image-map.json')
const GEO_MAP_PATH = path.join(DATA_DIR, '.geocode-map.json')

const DRY_RUN = process.argv.includes('--dry-run')
const SKIP_IMAGES = process.argv.includes('--skip-images')

/* ---- env ---------------------------------------------------- */
function loadEnv() {
  const envPath = path.join(__dirname, '..', '.env.local')
  const env = {}
  if (existsSync(envPath)) {
    for (const line of readFileSync(envPath, 'utf8').split('\n')) {
      const m = line.match(/^\s*([A-Z0-9_]+)\s*=\s*(.*)\s*$/)
      if (m) env[m[1]] = m[2]
    }
  }
  return { ...env, ...process.env }
}

const env = loadEnv()
const projectId = env.VITE_SANITY_PROJECT_ID
const dataset = env.VITE_SANITY_DATASET ?? 'production'
const token = env.SANITY_API_WRITE_TOKEN

if (!projectId || !token) {
  console.error('Missing VITE_SANITY_PROJECT_ID or SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

const client = createClient({ projectId, dataset, token, apiVersion: '2024-01-01', useCdn: false })

const readData = name => JSON.parse(readFileSync(path.join(DATA_DIR, name), 'utf8'))

/* ---- image migration ---------------------------------------- */
async function uploadImages(properties) {
  const imageMap = existsSync(IMAGE_MAP_PATH) ? JSON.parse(readFileSync(IMAGE_MAP_PATH, 'utf8')) : {}
  const refs = [...new Set(
    properties.flatMap(p => (p.images ?? []).map(img => img?.asset?._ref).filter(Boolean))
  )].filter(ref => !imageMap[ref])

  console.log(`Images: ${Object.keys(imageMap).length} cached, ${refs.length} to upload`)
  if (SKIP_IMAGES || DRY_RUN) return imageMap

  let done = 0
  const CONCURRENCY = 6
  async function worker(queue) {
    for (;;) {
      const ref = queue.pop()
      if (!ref) return
      try {
        const url = legacyImageUrl(ref)
        const res = await fetch(url)
        if (!res.ok) throw new Error(`HTTP ${res.status}`)
        const buffer = Buffer.from(await res.arrayBuffer())
        const asset = await client.assets.upload('image', buffer, {
          filename: url.split('/').pop(),
        })
        imageMap[ref] = asset._id
      } catch (err) {
        console.error(`  ✗ ${ref}: ${err.message}`)
      }
      done += 1
      if (done % 25 === 0) {
        writeFileSync(IMAGE_MAP_PATH, JSON.stringify(imageMap, null, 1))
        console.log(`  … ${done}/${refs.length}`)
      }
    }
  }

  const queue = [...refs]
  await Promise.all(Array.from({ length: CONCURRENCY }, () => worker(queue)))
  writeFileSync(IMAGE_MAP_PATH, JSON.stringify(imageMap, null, 1))
  console.log(`Images done: ${Object.keys(imageMap).length} total mapped`)
  return imageMap
}

/* ---- geocoding ----------------------------------------------- */
/** Resolve postcodes to lat/lng via postcodes.io (free, no key).
    Results cached in scripts/data/.geocode-map.json. */
async function geocodePostcodes(properties) {
  const geoMap = existsSync(GEO_MAP_PATH) ? JSON.parse(readFileSync(GEO_MAP_PATH, 'utf8')) : {}
  const wanted = [...new Set(
    properties.map(p => normalisePostcode(p.address?.postcode)).filter(Boolean)
  )].filter(pc => !(pc in geoMap))

  console.log(`Geocoding: ${Object.keys(geoMap).length} cached, ${wanted.length} to resolve`)
  if (wanted.length === 0) return geoMap

  for (let i = 0; i < wanted.length; i += 100) {
    const batch = wanted.slice(i, i + 100)
    const res = await fetch('https://api.postcodes.io/postcodes', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ postcodes: batch }),
    })
    if (!res.ok) throw new Error(`postcodes.io HTTP ${res.status}`)
    const { result } = await res.json()
    for (const item of result) {
      const pc = normalisePostcode(item.query)
      if (item.result) {
        geoMap[pc] = { lat: item.result.latitude, lng: item.result.longitude }
      } else {
        // cache misses too (null) so invalid postcodes aren't re-queried
        geoMap[pc] = null
        console.warn(`  ✗ no match for postcode "${item.query}"`)
      }
    }
  }

  writeFileSync(GEO_MAP_PATH, JSON.stringify(geoMap, null, 1))
  const hits = Object.values(geoMap).filter(Boolean).length
  console.log(`Geocoding done: ${hits}/${Object.keys(geoMap).length} postcodes resolved`)
  return geoMap
}

/* ---- main ---------------------------------------------------- */
async function main() {
  console.log(`Importing to ${projectId}/${dataset}${DRY_RUN ? ' (dry run)' : ''}\n`)

  const oldProperties = readData('properties.json')
  const oldReviews = readData('reviews.json')
  const oldContact = readData('contactPage.json')[0]
  const legalSources = [
    { file: 'privacyPage.json', slug: 'privacy', title: 'Privacy Policy' },
    { file: 'termsPage.json', slug: 'terms', title: 'Terms and Conditions' },
    { file: 'cookiesPage.json', slug: 'cookies', title: 'Cookie Policy' },
  ]

  const imageRefMap = await uploadImages(oldProperties)
  const geoMap = DRY_RUN ? {} : await geocodePostcodes(oldProperties)

  const slugs = assignSlugs(oldProperties)
  const properties = oldProperties.map((old, i) =>
    mapProperty(old, { slug: slugs[i], imageRefMap, geoMap })
  )
  // newest first so the homepage picks sensible featured properties
  const reviewsSorted = [...oldReviews].sort((a, b) =>
    String(b.date ?? b._createdAt).localeCompare(String(a.date ?? a._createdAt))
  )
  const reviews = reviewsSorted.map((old, i) => mapReview(old, i))
  const legalPages = legalSources.map(({ file, slug, title }) =>
    buildLegalPage(readData(file)[0], slug, title)
  )
  const homepageSettings = buildHomepageSettings()
  const siteSettings = buildSiteSettings(oldContact, reviews)

  const documents = [...properties, ...reviews, ...legalPages, homepageSettings, siteSettings]
  console.log(`\nDocuments: ${properties.length} properties, ${reviews.length} reviews, ${legalPages.length} legal pages, 2 singletons`)

  if (DRY_RUN) {
    console.log(JSON.stringify(documents.slice(0, 2), null, 2))
    return
  }

  const BATCH = 20
  for (let i = 0; i < documents.length; i += BATCH) {
    const tx = client.transaction()
    for (const doc of documents.slice(i, i + BATCH)) tx.createOrReplace(doc)
    await tx.commit()
    console.log(`  committed ${Math.min(i + BATCH, documents.length)}/${documents.length}`)
  }

  console.log('\nImport complete ✓')
}

main().catch(err => {
  console.error(err)
  process.exit(1)
})
