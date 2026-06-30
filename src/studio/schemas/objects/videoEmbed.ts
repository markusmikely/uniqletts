import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'videoEmbed',
  title: 'Video',
  type: 'object',
  fields: [
    defineField({
      name: 'type',
      title: 'Video type',
      type: 'string',
      options: {
        list: [
          { title: 'YouTube / Vimeo URL', value: 'url' },
          { title: 'Uploaded file', value: 'file' },
        ],
        layout: 'radio',
      },
      initialValue: 'url',
    }),
    defineField({
      name: 'url',
      title: 'Video URL',
      type: 'url',
      hidden: ({ parent }) => parent?.type !== 'url',
    }),
    defineField({
      name: 'file',
      title: 'Video file',
      type: 'file',
      options: { accept: 'video/*' },
      hidden: ({ parent }) => parent?.type !== 'file',
    }),
  ],
})
