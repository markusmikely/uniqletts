/// <reference types="vite/client" />
import { defineConfig } from 'sanity'
import { structureTool } from 'sanity/structure'
import { visionTool } from '@sanity/vision'
import { schemaTypes } from './src/studio/schemas'
import { structure } from './src/studio/structure'
import { ForwardEnquiryAction } from './src/studio/actions/forwardEnquiry'
import { uniqlettsTheme } from './src/studio/theme'
import { StudioLogo } from './src/studio/components/StudioLogo'

const projectId = import.meta.env.VITE_SANITY_PROJECT_ID ?? 'placeholder'
const dataset = import.meta.env.VITE_SANITY_DATASET ?? 'production'

export default defineConfig({
  name: 'uniqletts',
  title: 'Uniqletts Admin',
  projectId,
  dataset,
  basePath: '/admin',
  theme: uniqlettsTheme,
  studio: {
    components: {
      logo: StudioLogo,
    },
  },
  plugins: [
    structureTool({ structure }),
    visionTool(),
  ],
  schema: {
    types: schemaTypes,
  },
  document: {
    actions: (prev, context) => {
      if (context.schemaType === 'enquiry') {
        return [...prev, ForwardEnquiryAction]
      }
      return prev
    },
  },
})
