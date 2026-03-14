import type { CollectionConfig } from 'payload'

export const Media: CollectionConfig = {
  slug: 'media',
  upload: true,
  access: {
    read: () => true,
    create: ({ req: { user } }) => ['admin', 'editor'].includes(user?.role || ''),
    update: ({ req: { user } }) => ['admin', 'editor'].includes(user?.role || ''),
    delete: ({ req: { user } }) => ['admin', 'editor'].includes(user?.role || ''),
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      required: true,
    },
  ],
}
