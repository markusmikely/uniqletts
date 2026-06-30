import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'address',
  title: 'Address',
  type: 'object',
  fields: [
    defineField({ name: 'line1', title: 'Address line 1', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'area', title: 'Area', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'postcode', title: 'Postcode', type: 'string', validation: Rule => Rule.required() }),
    defineField({ name: 'geopoint', title: 'Location', type: 'geopoint' }),
  ],
})
