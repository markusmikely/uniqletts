import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'legalPage',
  title: 'Legal Page',
  type: 'document',
  fields: [
    defineField({ name: 'title', title: 'Title', type: 'string', validation: Rule => Rule.required() }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {
        source: 'title',
        slugify: input => input.toLowerCase().replace(/\s+/g, '-'),
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'body',
      title: 'Content',
      type: 'array',
      of: [{ type: 'block' }],
    }),
  ],
  preview: {
    select: { title: 'title', subtitle: 'slug.current' },
  },
})
