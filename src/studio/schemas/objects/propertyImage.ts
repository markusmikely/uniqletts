import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'propertyImage',
  title: 'Property Image',
  type: 'object',
  fields: [
    defineField({
      name: 'asset',
      title: 'Image',
      type: 'image',
      options: { hotspot: true },
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'alt', title: 'Alt text', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'caption', title: 'Caption', type: 'string' }),
  ],
  preview: {
    select: { title: 'alt', media: 'asset' },
  },
})
