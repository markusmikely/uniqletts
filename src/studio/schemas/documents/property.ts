import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'property',
  title: 'Property',
  type: 'document',
  groups: [
    { name: 'details', title: 'Details', default: true },
    { name: 'media', title: 'Media' },
    { name: 'meta', title: 'Meta' },
  ],
  fields: [
    defineField({
      name: 'title',
      title: 'Title',
      type: 'string',
      group: 'details',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      group: 'details',
      options: { source: 'title', maxLength: 96 },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'listingType',
      title: 'Listing type',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Lettings', value: 'lettings' },
          { title: 'Sales', value: 'sales' },
        ],
        layout: 'radio',
      },
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Available', value: 'available' },
          { title: 'Let agreed', value: 'let-agreed' },
          { title: 'Under offer', value: 'under-offer' },
          { title: 'Sold', value: 'sold' },
        ],
      },
      initialValue: 'available',
      validation: Rule => Rule.required(),
    }),
    defineField({
      name: 'propertyType',
      title: 'Property type',
      type: 'string',
      group: 'details',
      options: {
        list: ['studio', 'flat', 'house', 'maisonette'],
      },
    }),
    defineField({ name: 'price', title: 'Price', type: 'number', group: 'details', validation: Rule => Rule.required().min(0) }),
    defineField({
      name: 'pricePeriod',
      title: 'Price period',
      type: 'string',
      group: 'details',
      options: {
        list: [
          { title: 'Per calendar month', value: 'pcm' },
          { title: 'Per week', value: 'pw' },
          { title: 'Sale price', value: 'sale' },
        ],
      },
      validation: Rule => Rule.required(),
    }),
    defineField({ name: 'bedrooms', title: 'Bedrooms', type: 'number', group: 'details', validation: Rule => Rule.required().min(0) }),
    defineField({ name: 'bathrooms', title: 'Bathrooms', type: 'number', group: 'details', validation: Rule => Rule.required().min(0) }),
    defineField({ name: 'epcRating', title: 'EPC rating', type: 'string', group: 'details' }),
    defineField({ name: 'availableFrom', title: 'Available from', type: 'date', group: 'details' }),
    defineField({ name: 'address', title: 'Address', type: 'address', group: 'details', validation: Rule => Rule.required() }),
    defineField({
      name: 'description',
      title: 'Description',
      type: 'array',
      group: 'details',
      of: [{ type: 'block' }],
    }),
    defineField({
      name: 'features',
      title: 'Features',
      type: 'array',
      group: 'details',
      of: [{ type: 'string' }],
      options: { layout: 'tags' },
    }),
    defineField({
      name: 'images',
      title: 'Image gallery',
      type: 'array',
      group: 'media',
      of: [{ type: 'propertyImage' }],
      validation: Rule => Rule.min(1),
    }),
    defineField({
      name: 'floorplan',
      title: 'Floor plan',
      type: 'image',
      group: 'media',
      options: { hotspot: true },
    }),
    defineField({
      name: 'video',
      title: 'Video tour',
      type: 'videoEmbed',
      group: 'media',
    }),
    defineField({ name: 'isFeatured', title: 'Featured property', type: 'boolean', group: 'meta', initialValue: false }),
    defineField({ name: 'tag', title: 'Tag label', type: 'string', group: 'meta', description: 'e.g. "New listing", "Featured"' }),
    defineField({ name: 'viewCount', title: 'View count', type: 'number', group: 'meta', readOnly: true, initialValue: 0 }),
    defineField({ name: 'publishedAt', title: 'Published at', type: 'datetime', group: 'meta' }),
  ],
  orderings: [
    { title: 'Published date, newest', name: 'publishedAtDesc', by: [{ field: 'publishedAt', direction: 'desc' }] },
    { title: 'Price, low to high', name: 'priceAsc', by: [{ field: 'price', direction: 'asc' }] },
    { title: 'Most viewed', name: 'viewCountDesc', by: [{ field: 'viewCount', direction: 'desc' }] },
  ],
  preview: {
    select: {
      title: 'title',
      subtitle: 'address.line1',
      media: 'images.0.asset',
      listingType: 'listingType',
      status: 'status',
    },
    prepare({ title, subtitle, media, listingType, status }) {
      return {
        title,
        subtitle: `${listingType ?? ''} · ${status ?? ''} · ${subtitle ?? ''}`,
        media,
      }
    },
  },
})
