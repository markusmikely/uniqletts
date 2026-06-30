import { defineField, defineType } from 'sanity'

export default defineType({
  name: 'openingHours',
  title: 'Opening Hours',
  type: 'object',
  fields: [
    defineField({ name: 'weekdays', title: 'Monday – Friday', type: 'string' }),
    defineField({ name: 'saturday', title: 'Saturday', type: 'string' }),
    defineField({ name: 'sunday', title: 'Sunday', type: 'string' }),
  ],
})
