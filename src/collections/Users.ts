import type { CollectionConfig } from 'payload'

export const Users: CollectionConfig = {
  slug: 'users',
  auth: {
    maxLoginAttempts: 0,
  },
  admin: {
    useAsTitle: 'email',
  },
  fields: [
    {
      name: 'name',
      type: 'text',
      required: true,
    },
    {
      name: 'role',
      type: 'select',
      defaultValue: 'contributor',
      required: true,
      options: [
        { label: 'Admin', value: 'admin' },
        { label: 'Editor', value: 'editor' },
        { label: 'Contributor', value: 'contributor' },
      ],
      saveToJWT: true,
      access: {
        read: () => true,
        update: ({ req: { user } }) => user?.role === 'admin',
      }
    }
  ],
}
