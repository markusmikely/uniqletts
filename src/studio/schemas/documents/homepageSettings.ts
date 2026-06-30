import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'homepageSettings',
  title: 'Homepage Settings',
  type: 'document',
  fields: [
    defineField({
      name: 'blockManagement',
      title: 'Block management section',
      type: 'object',
      fields: [
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'body', title: 'Body', type: 'text', rows: 4 }),
        defineField({ name: 'ctaLabel', title: 'CTA label', type: 'string' }),
        defineField({ name: 'ctaHref', title: 'CTA link', type: 'string' }),
        defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
      ],
    }),
    defineField({
      name: 'areaHighlight',
      title: 'Area highlight section',
      type: 'object',
      fields: [
        defineField({ name: 'eyebrow', title: 'Eyebrow', type: 'string' }),
        defineField({ name: 'title', title: 'Title', type: 'string' }),
        defineField({ name: 'paragraphs', title: 'Paragraphs', type: 'array', of: [{ type: 'text' }] }),
        defineField({ name: 'image', title: 'Image', type: 'image', options: { hotspot: true } }),
        defineField({ name: 'imageCaption', title: 'Image caption', type: 'string' }),
      ],
    }),
    defineField({
      name: 'featuredMode',
      title: 'Featured properties mode',
      type: 'string',
      options: {
        list: [
          { title: 'Auto (isFeatured flag)', value: 'auto' },
          { title: 'Manual selection', value: 'manual' },
        ],
      },
      initialValue: 'auto',
    }),
    defineField({
      name: 'featuredProperties',
      title: 'Manually selected featured properties',
      type: 'array',
      of: [{ type: 'reference', to: [{ type: 'property' }] }],
      hidden: ({ document }) => document?.featuredMode !== 'manual',
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Homepage Settings' }
    },
  },
})
