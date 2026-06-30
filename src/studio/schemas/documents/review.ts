import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'review',
  title: 'Review',
  type: 'document',
  fields: [
    defineField({
      name: 'source',
      title: 'Source',
      type: 'string',
      options: {
        list: [
          { title: 'Internal / custom', value: 'custom' },
          { title: 'Google', value: 'google' },
          { title: 'Trustpilot', value: 'trustpilot' },
        ],
      },
      initialValue: 'custom',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'externalId',
      title: 'External ID',
      type: 'string',
      description: 'For future Google/Trustpilot sync — unique ID from the source platform',
      hidden: ({ document }) => document?.source === 'custom',
    }),
    defineField({ name: 'rating', title: 'Rating', type: 'number', validation: Rule => Rule.required().min(1).max(5) }),
    defineField({ name: 'text', title: 'Review text', type: 'text', rows: 4, validation: Rule => Rule.required() }),
    defineField({ name: 'author', title: 'Author', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'date', title: 'Review date', type: 'date', validation: Rule => Rule.required() }),
    defineField({
      name: 'status',
      title: 'Moderation status',
      type: 'string',
      options: {
        list: [
          { title: 'Pending approval', value: 'pending' },
          { title: 'Approved', value: 'approved' },
          { title: 'Rejected', value: 'rejected' },
        ],
      },
      initialValue: 'approved',
    }),
    defineField({ name: 'showOnSite', title: 'Show on website', type: 'boolean', initialValue: true }),
    defineField({ name: 'isPinned', title: 'Pin to top', type: 'boolean', initialValue: false }),
    defineField({ name: 'sortOrder', title: 'Sort order', type: 'number', initialValue: 0 }),
    defineField({
      name: 'property',
      title: 'Related property',
      type: 'reference',
      to: [{ type: 'property' }],
    }),
  ],
  orderings: [
    { title: 'Sort order', name: 'sortOrderAsc', by: [{ field: 'sortOrder', direction: 'asc' }] },
    { title: 'Date, newest', name: 'dateDesc', by: [{ field: 'date', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'author', subtitle: 'text', rating: 'rating', source: 'source' },
    prepare({ title, subtitle, rating, source }) {
      return {
        title: `${title} (${'★'.repeat(rating ?? 0)})`,
        subtitle: `${source} — ${subtitle?.slice(0, 60)}…`,
      }
    },
  },
})
