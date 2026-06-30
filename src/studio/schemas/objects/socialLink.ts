import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'socialLink',
  title: 'Social Link',
  type: 'object',
  fields: [
    defineField({
      name: 'platform',
      title: 'Platform',
      type: 'string',
      options: {
        list: [
          { title: 'WhatsApp', value: 'whatsapp' },
          { title: 'Instagram', value: 'instagram' },
          { title: 'X (Twitter)', value: 'x' },
          { title: 'Facebook', value: 'facebook' },
          { title: 'LinkedIn', value: 'linkedin' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'url', title: 'URL', type: 'url', validation: Rule => Rule.required() }),
    defineField({ name: 'enabled', title: 'Show on site', type: 'boolean', initialValue: true }),
  ],
  preview: {
    select: { title: 'platform', subtitle: 'url' },
  },
})
