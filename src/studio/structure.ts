import type { StructureBuilder } from 'sanity/structure'
import { Dashboard } from './tools/Dashboard'

const singleton = (S: StructureBuilder, typeName: string, title: string, documentId: string) =>
  S.listItem()
    .title(title)
    .id(documentId)
    .child(S.document().schemaType(typeName).documentId(documentId).title(title))

const enquiryList = (S: StructureBuilder, type: string, title: string) =>
  S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .filter('_type == "enquiry" && type == $type')
        .params({ type })
        .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
    )

const propertyList = (S: StructureBuilder, status: string, title: string) =>
  S.listItem()
    .title(title)
    .child(
      S.documentList()
        .title(title)
        .filter('_type == "property" && status == $status')
        .params({ status })
        .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
    )

export const structure = (S: StructureBuilder) =>
  S.list()
    .title('Uniqletts Admin')
    .items([
      S.listItem()
        .title('Dashboard')
        .child(S.component(Dashboard).title('Analytics Dashboard')),

      S.divider(),

      S.listItem()
        .title('Properties')
        .child(
          S.list()
            .title('Properties')
            .items([
              S.listItem()
                .title('All properties')
                .child(
                  S.documentList()
                    .title('All properties')
                    .filter('_type == "property"')
                    .defaultOrdering([{ field: 'publishedAt', direction: 'desc' }])
                ),
              S.divider(),
              propertyList(S, 'available', 'Available'),
              propertyList(S, 'let-agreed', 'Let agreed'),
              propertyList(S, 'under-offer', 'Under offer'),
              propertyList(S, 'sold', 'Sold'),
            ])
        ),

      S.listItem()
        .title('Enquiries')
        .child(
          S.list()
            .title('Enquiries')
            .items([
              S.listItem()
                .title('New / unanswered')
                .child(
                  S.documentList()
                    .title('New enquiries')
                    .filter('_type == "enquiry" && status == "new"')
                    .defaultOrdering([{ field: 'createdAt', direction: 'desc' }])
                ),
              S.divider(),
              enquiryList(S, 'valuation', 'Valuations'),
              enquiryList(S, 'viewing', 'Viewings'),
              enquiryList(S, 'contact', 'Contact'),
              enquiryList(S, 'maintenance', 'Maintenance'),
              enquiryList(S, 'general', 'General'),
            ])
        ),

      S.listItem()
        .title('Reviews')
        .child(
          S.list()
            .title('Reviews')
            .items([
              S.listItem()
                .title('Pending approval')
                .child(
                  S.documentList()
                    .title('Pending reviews')
                    .filter('_type == "review" && status == "pending"')
                    .defaultOrdering([{ field: 'date', direction: 'desc' }])
                ),
              S.listItem()
                .title('Live on site')
                .child(
                  S.documentList()
                    .title('Live reviews')
                    .filter('_type == "review" && showOnSite == true && status == "approved"')
                    .defaultOrdering([{ field: 'sortOrder', direction: 'asc' }])
                ),
              S.listItem()
                .title('All reviews')
                .child(
                  S.documentList()
                    .title('All reviews')
                    .filter('_type == "review"')
                    .defaultOrdering([{ field: 'date', direction: 'desc' }])
                ),
            ])
        ),

      S.divider(),

      singleton(S, 'homepageSettings', 'Homepage', 'homepageSettings'),
      singleton(S, 'siteSettings', 'Site Settings', 'siteSettings'),

      S.listItem()
        .title('Legal pages')
        .child(
          S.documentList()
            .title('Legal pages')
            .filter('_type == "legalPage"')
        ),
    ])
