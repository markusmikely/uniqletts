import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'noteEntry',
  title: 'Note',
  type: 'object',
  fields: [
    defineField({ name: 'text', title: 'Note', type: 'text', rows: 3, validation: Rule => Rule.required() }),
    defineField({ name: 'author', title: 'Author', type: 'string' }),
    defineField({ name: 'timestamp', title: 'Timestamp', type: 'datetime', initialValue: () => new Date().toISOString() }),
  ],
  preview: {
    select: { title: 'text', subtitle: 'author' },
  },
})
