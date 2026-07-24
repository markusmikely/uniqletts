/* ============================================================
   UPDATE LEGAL PAGES — refresh privacy / terms / cookies content
   ------------------------------------------------------------
   Usage:  node scripts/update-legal.mjs [--dry-run]

   Rewrites the three `legalPage` documents in Sanity with current
   (2026) UK-aligned content. Idempotent — targets the deterministic
   _ids created by the import (legalPage-privacy/terms/cookies).

   ⚠️  These are professionally-structured templates, not legal
   advice. Have a solicitor review before publishing, and confirm
   the placeholders marked "CONFIRM:" (registered office, ICO
   registration number, redress scheme, CMP provider).
   ============================================================ */

import { createClient } from '@sanity/client'
import { readFileSync, existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const DRY_RUN = process.argv.includes('--dry-run')

/* ---- env (same loader as import-content.mjs) ---------------- */
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

/* ---- portable-text builder --------------------------------- */
let keySeq = 0
const key = () => `k${(keySeq++).toString(36)}`

/** Convert a compact section spec into Portable Text blocks.
    Supported: {h2}, {h3}, {p}, {ul:[...]} */
function pt(sections) {
  const blocks = []
  for (const s of sections) {
    if (s.h2 != null) blocks.push(block('h2', s.h2))
    else if (s.h3 != null) blocks.push(block('h3', s.h3))
    else if (s.p != null) blocks.push(block('normal', s.p))
    else if (s.ul) for (const item of s.ul) blocks.push(listItem(item))
  }
  return blocks
}

function block(style, text) {
  return {
    _type: 'block',
    _key: key(),
    style,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

function listItem(text) {
  return {
    _type: 'block',
    _key: key(),
    style: 'normal',
    listItem: 'bullet',
    level: 1,
    markDefs: [],
    children: [{ _type: 'span', _key: key(), text, marks: [] }],
  }
}

/* ---- shared company facts ---------------------------------- */
const COMPANY = 'Uniqletts Limited'
const COMPANY_NO = '07055697'
const ADDRESS = 'Suite 14, 23 Redan Place, Bayswater, London W2 4SA' // CONFIRM: registered office vs trading address at Companies House
const EMAIL = 'info@uniqletts.com'
const PHONE = '020 7221 4000'

/* ============================================================
   PRIVACY POLICY
   ============================================================ */
const PRIVACY = pt([
  { p: `${COMPANY} ("we", "us", "our") is committed to protecting your personal data and respecting your privacy. This notice explains how we collect, use, share and protect your personal data when you use our website, enquire about a property, or use our lettings, sales, property management and block management services, and it sets out your rights under data protection law.` },
  { p: `We are the "data controller" of your personal data. ${COMPANY} is registered in England and Wales (company number ${COMPANY_NO}), with its office at ${ADDRESS}. We are registered with the Information Commissioner's Office (ICO) as a data controller.` },
  { p: `We process personal data in accordance with the UK General Data Protection Regulation (UK GDPR), the Data Protection Act 2018 as amended by the Data (Use and Access) Act 2025, and the Privacy and Electronic Communications Regulations (PECR).` },

  { h2: 'The personal data we collect' },
  { p: 'Depending on your relationship with us, we may collect and process the following categories of personal data:' },
  { ul: [
    'Identity data — name, title, date of birth, nationality, and photographic ID or passport details where required for identity, Right to Rent or anti-money-laundering checks.',
    'Contact data — address, email address and telephone numbers.',
    'Financial data — bank details, proof of income, employment and affordability information, and, for landlords and vendors, payment and account details.',
    'Transaction data — details of the properties you are letting, renting, buying, selling or that we manage on your behalf, and records of our correspondence and dealings with you.',
    'Verification data — Right to Rent status, references, credit and background checks, and anti-money-laundering documentation.',
    'Technical and usage data — IP address, browser type, device information, and how you use our website (collected via cookies — see our Cookies Policy).',
    'Marketing data — your preferences for receiving marketing from us and your communication preferences.',
  ] },
  { p: 'We do not routinely collect special category data. Where a limited amount is unavoidable (for example, health information relevant to a reasonable adjustment or a tenancy), we process it only with an appropriate lawful basis and additional safeguards.' },

  { h2: 'How we collect your data' },
  { ul: [
    'Directly from you — when you enquire, register your details, arrange a viewing, make an application, or instruct us.',
    'Automatically — through cookies and similar technologies when you use our website.',
    'From third parties — referencing and credit-check agencies, property portals (such as Rightmove and Zoopla), joint agents, your previous or current landlord or letting agent, and publicly available sources.',
  ] },

  { h2: 'How and why we use your data' },
  { p: 'We only use your personal data where the law allows us to. Most commonly we rely on the following lawful bases:' },
  { ul: [
    'Performance of a contract — to provide our lettings, sales, management and block-management services and to take steps at your request before entering into a contract.',
    'Legal obligation — to comply with our legal and regulatory duties, including Right to Rent checks under the Immigration Act 2014, anti-money-laundering obligations under the Money Laundering Regulations 2017, tenancy deposit protection, and the Tenant Fees Act 2019.',
    'Legitimate interests — to run and promote our business, respond to enquiries, keep records, prevent fraud and improve our services, provided your rights do not override those interests.',
    'Consent — for certain marketing communications and non-essential cookies, which you can withdraw at any time.',
  ] },

  { h2: 'Who we share your data with' },
  { p: 'We may share your personal data, only as necessary, with:' },
  { ul: [
    'Landlords, tenants, buyers and sellers involved in a transaction we are handling.',
    'Referencing, credit-check and anti-money-laundering providers.',
    'Tenancy deposit protection schemes (such as the TDS or DPS).',
    'Contractors and tradespeople instructed to carry out maintenance or works.',
    'Property portals and marketing partners used to advertise properties.',
    'Our professional advisers, including solicitors, accountants and auditors.',
    'Our redress scheme and Client Money Protection provider. (CONFIRM: name the schemes you belong to.)',
    'Regulators, law enforcement and government bodies where we are legally required to do so.',
  ] },
  { p: 'We require all third parties to respect the security of your personal data and to treat it in accordance with the law. We do not sell your personal data.' },

  { h2: 'International transfers' },
  { p: 'We aim to keep your personal data within the UK. Where a supplier processes data outside the UK, we ensure an appropriate safeguard is in place — such as a country covered by UK "adequacy" regulations or an International Data Transfer Agreement (IDTA).' },

  { h2: 'How long we keep your data' },
  { p: 'We keep your personal data only for as long as necessary to fulfil the purposes we collected it for, including to satisfy any legal, accounting, tax or reporting requirements. Anti-money-laundering records are generally retained for five years after the end of our business relationship. Where data is no longer required, we securely delete or anonymise it.' },

  { h2: 'Your rights' },
  { p: 'Under data protection law you have the right to:' },
  { ul: [
    'Request access to the personal data we hold about you.',
    'Request correction of inaccurate or incomplete data.',
    'Request erasure of your data where there is no good reason for us to continue processing it.',
    'Object to processing based on our legitimate interests, and to direct marketing at any time.',
    'Request restriction of processing in certain circumstances.',
    'Request the transfer of your data to you or a third party (data portability).',
    'Withdraw consent at any time where we rely on consent.',
  ] },
  { p: `To exercise any of these rights, please contact us at ${EMAIL}. We will respond within one month. You will not usually have to pay a fee.` },

  { h2: 'Cookies' },
  { p: 'Our website uses cookies and similar technologies. For details of the cookies we use and how to manage your preferences, please see our Cookies Policy.' },

  { h2: 'Data security' },
  { p: 'We have put in place appropriate technical and organisational measures to prevent your personal data from being accidentally lost, used or accessed in an unauthorised way. We limit access to those who have a genuine business need, and we have procedures to deal with any suspected data breach.' },

  { h2: 'Changes to this notice and complaints' },
  { p: 'We may update this privacy notice from time to time. The date at the top of this page shows when it was last reviewed. If you have any concerns about how we handle your data, please contact us first so we can try to resolve them.' },
  { p: `You also have the right to complain to the Information Commissioner's Office (ICO), the UK regulator for data protection, at ico.org.uk or on 0303 123 1113.` },
  { p: `Contact us: ${COMPANY}, ${ADDRESS}. Email ${EMAIL} · Telephone ${PHONE}.` },
])

/* ============================================================
   TERMS OF USE
   ============================================================ */
const TERMS = pt([
  { p: `These terms of use govern your use of the ${COMPANY} website. By accessing or using this website you agree to be bound by these terms. If you do not agree, please do not use the website.` },
  { p: `This website is operated by ${COMPANY}, registered in England and Wales (company number ${COMPANY_NO}), ${ADDRESS}.` },

  { h2: 'Using our website' },
  { p: 'You may use our website for lawful purposes only. You must not use it in any way that breaches applicable law, is fraudulent, or seeks to harm or impair the website, its security or other users. We may suspend or withdraw all or part of the website at any time without notice.' },

  { h2: 'Property listings and information' },
  { p: 'The content on this website, including property particulars, is provided for general information only and does not constitute an offer, a contract, or professional advice. Property particulars are prepared in good faith and in accordance with the Consumer Protection from Unfair Trading Regulations 2008, but they should not be relied upon as statements or representations of fact.' },
  { p: 'Measurements, floor plans, images and descriptions are indicative only. Prices, availability and details are subject to change or withdrawal without notice. You should satisfy yourself as to the accuracy of any information before entering into any transaction.' },

  { h2: 'Intellectual property' },
  { p: `The content of this website — including text, graphics, logos, images and design — is owned by or licensed to ${COMPANY} and is protected by copyright and other intellectual property laws. You may view and print pages for your own personal use, but you must not reproduce, distribute or exploit any content commercially without our prior written consent.` },

  { h2: 'Links to other websites' },
  { p: 'Our website may contain links to third-party websites. These links are provided for your convenience only. We have no control over, and accept no responsibility for, the content of those websites or any loss arising from your use of them.' },

  { h2: 'Our liability' },
  { p: 'While we make reasonable efforts to keep the information on this website accurate and up to date, we give no warranty that it is complete, accurate or current. To the fullest extent permitted by law, we exclude liability for any loss or damage arising from your use of, or inability to use, this website. Nothing in these terms excludes or limits our liability for death or personal injury caused by negligence, or for fraud, or any other liability that cannot be excluded by law.' },

  { h2: 'Privacy' },
  { p: 'Your use of this website is also governed by our Privacy Policy and Cookies Policy, which explain how we collect and use your personal data.' },

  { h2: 'Governing law' },
  { p: 'These terms are governed by the laws of England and Wales, and any disputes will be subject to the exclusive jurisdiction of the courts of England and Wales.' },

  { h2: 'Changes and contact' },
  { p: `We may revise these terms at any time by amending this page. Please check this page from time to time to take notice of any changes. If you have any questions about these terms, contact us at ${EMAIL} or ${PHONE}.` },
])

/* ============================================================
   COOKIES POLICY
   ============================================================ */
const COOKIES = pt([
  { p: `This Cookies Policy explains how ${COMPANY} uses cookies and similar technologies on our website, and how you can manage them. It should be read alongside our Privacy Policy.` },

  { h2: 'What are cookies?' },
  { p: 'Cookies are small text files that are placed on your device when you visit a website. They are widely used to make websites work, to improve their performance, and to provide information to the site owner. Similar technologies such as pixels and local storage work in the same way.' },

  { h2: 'How we use cookies' },
  { p: 'We use cookies to keep our website running, to understand how visitors use it, to remember your preferences, and — where you consent — to measure the effectiveness of our marketing. We group the cookies we use into the following categories:' },
  { ul: [
    'Strictly necessary cookies — required for the website to function, for example to remember your cookie preferences. These do not require consent.',
    'Performance and analytics cookies — help us understand how visitors interact with the website, using tools such as Google Analytics, so we can improve it.',
    'Functional cookies — remember choices you make to provide a more personalised experience.',
    'Targeting cookies — used to measure and improve the relevance of any advertising. We only set these with your consent.',
  ] },

  { h2: 'Consent' },
  { p: 'Under the Privacy and Electronic Communications Regulations (PECR), we set non-essential cookies only where you have given your consent. When you first visit our website you will be asked whether you accept non-essential cookies, and you can change your choice at any time.' },

  { h2: 'Managing cookies' },
  { p: 'You can control and delete cookies through your browser settings. Most browsers let you refuse or delete cookies; please refer to your browser\'s help pages for instructions. Please note that if you block strictly necessary cookies, parts of the website may not function correctly.' },

  { h2: 'Changes and contact' },
  { p: `We may update this Cookies Policy from time to time. The date at the top of this page shows when it was last reviewed. If you have any questions, please contact us at ${EMAIL} or ${PHONE}.` },
])

/* ---- write ------------------------------------------------- */
const DOCS = [
  { id: 'legalPage-privacy', title: 'Privacy Policy', body: PRIVACY },
  { id: 'legalPage-terms', title: 'Terms of Use', body: TERMS },
  { id: 'legalPage-cookies', title: 'Cookie Policy', body: COOKIES },
]

async function run() {
  for (const doc of DOCS) {
    console.log(`${doc.title} — ${doc.body.length} blocks`)
    if (DRY_RUN) continue
    await client
      .patch(doc.id)
      .set({ title: doc.title, body: doc.body })
      .commit()
    console.log(`  ✓ updated ${doc.id}`)
  }
  console.log(DRY_RUN ? '\nDry run — nothing written.' : '\nLegal pages updated ✓')
}

run().catch(err => {
  console.error(err)
  process.exit(1)
})
