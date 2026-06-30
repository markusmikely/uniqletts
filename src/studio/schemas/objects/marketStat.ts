import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'marketStat',
  title: 'Market Stat',
  type: 'object',
  fields: [
    defineField({ name: 'label', title: 'Label', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'value', title: 'Value', type: 'string', validation: Rule => Rule.required() }),
  ],
  preview: {
    select: { title: 'label', subtitle: 'value' },
  },
})
