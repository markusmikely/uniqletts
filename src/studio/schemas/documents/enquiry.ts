import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'enquiry',
  title: 'Enquiry',
  type: 'document',
  fields: [
    defineField({
      name: 'type',
      title: 'Enquiry type',
      type: 'string',
      options: {
        list: [
          { title: 'Valuation', value: 'valuation' },
          { title: 'Viewing', value: 'viewing' },
          { title: 'Contact', value: 'contact' },
          { title: 'Maintenance', value: 'maintenance' },
          { title: 'General', value: 'general' },
        ],
      },
      validation: Rule => Rule.required(),
      readOnly: true,
    }),
    defineField({ name: 'name', title: 'Name', type: 'string', validation: Rule => Rule.required(), readOnly: true }),
    defineField({ name: 'email', title: 'Email', type: 'string', validation: Rule => Rule.required(), readOnly: true }),
    defineField({ name: 'phone', title: 'Phone', type: 'string', readOnly: true }),
    defineField({ name: 'message', title: 'Message', type: 'text', rows: 4, readOnly: true }),
    defineField({
      name: 'property',
      title: 'Related property',
      type: 'reference',
      to: [{ type: 'property' }],
      readOnly: true,
    }),
    defineField({ name: 'propertySlug', title: 'Property slug', type: 'string', readOnly: true }),
    defineField({ name: 'subject', title: 'Subject', type: 'string', readOnly: true }),
    // Valuation-specific
    defineField({ name: 'valuationAddress', title: 'Property address (valuation)', type: 'string', readOnly: true }),
    defineField({ name: 'valuationPropertyType', title: 'Property type (valuation)', type: 'string', readOnly: true }),
    defineField({ name: 'valuationBedrooms', title: 'Bedrooms (valuation)', type: 'string', readOnly: true }),
    defineField({ name: 'preferredCallTime', title: 'Preferred call time', type: 'string', readOnly: true }),
    // Viewing-specific
    defineField({ name: 'preferredDate', title: 'Preferred viewing date', type: 'date', readOnly: true }),
    // Maintenance-specific
    defineField({ name: 'maintenanceAddress', title: 'Property address (maintenance)', type: 'string', readOnly: true }),
    defineField({ name: 'maintenanceIssue', title: 'Issue description', type: 'text', rows: 3, readOnly: true }),
    defineField({
      name: 'status',
      title: 'Status',
      type: 'string',
      options: {
        list: [
          { title: 'New', value: 'new' },
          { title: 'Contacted', value: 'contacted' },
          { title: 'Converted', value: 'converted' },
          { title: 'Closed', value: 'closed' },
        ],
      },
      initialValue: 'new',
    }),
    defineField({
      name: 'notes',
      title: 'Internal notes',
      type: 'array',
      of: [{ type: 'noteEntry' }],
    }),
    defineField({ name: 'forwardedAt', title: 'Last forwarded at', type: 'datetime', readOnly: true }),
    defineField({ name: 'createdAt', title: 'Submitted at', type: 'datetime', readOnly: true }),
  ],
  orderings: [
    { title: 'Newest first', name: 'createdAtDesc', by: [{ field: 'createdAt', direction: 'desc' }] },
  ],
  preview: {
    select: { title: 'name', subtitle: 'type', status: 'status', createdAt: 'createdAt' },
    prepare({ title, subtitle, status, createdAt }) {
      return {
        title: `${title} (${subtitle})`,
        subtitle: `${status} — ${createdAt ? new Date(createdAt).toLocaleDateString('en-GB') : ''}`,
      }
    },
  },
})
