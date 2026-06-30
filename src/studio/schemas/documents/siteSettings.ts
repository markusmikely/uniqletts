import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'siteSettings',
  title: 'Site Settings',
  type: 'document',
  fields: [
    defineField({ name: 'phone', title: 'Phone', type: 'string' }),
    defineField({ name: 'email', title: 'Email', type: 'string' }),
    defineField({ name: 'whatsappNumber', title: 'WhatsApp number', type: 'string', description: 'E.164 format without +, e.g. 442035442456' }),
    defineField({
      name: 'officeAddress',
      title: 'Office address',
      type: 'text',
      rows: 3,
    }),
    defineField({ name: 'openingHours', title: 'Opening hours', type: 'openingHours' }),
    defineField({
      name: 'socialLinks',
      title: 'Social links',
      type: 'array',
      of: [{ type: 'socialLink' }],
    }),
    defineField({
      name: 'marketSnapshot',
      title: 'Market snapshot stats',
      type: 'array',
      of: [{ type: 'marketStat' }],
    }),
    defineField({ name: 'aggregateRating', title: 'Aggregate review rating', type: 'number', validation: Rule => Rule.min(0).max(5) }),
    defineField({ name: 'reviewCount', title: 'Total review count', type: 'number' }),
    defineField({
      name: 'accreditations',
      title: 'Accreditations',
      type: 'array',
      of: [{
        type: 'object',
        fields: [
          defineField({ name: 'id', title: 'ID', type: 'string' }),
          defineField({ name: 'label', title: 'Label', type: 'string' }),
          defineField({ name: 'image', title: 'Logo', type: 'image' }),
        ],
      }],
    }),
  ],
  preview: {
    prepare() {
      return { title: 'Site Settings' }
    },
  },
})
