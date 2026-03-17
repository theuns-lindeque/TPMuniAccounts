import type { CollectionConfig } from "payload";

export const Users: CollectionConfig = {
  slug: "users",
  auth: true,
  admin: {
    useAsTitle: "email",
  },
  access: {
    read: () => true,
    create: () => true,
    update: ({ req: { user } }) => user?.role === "admin",
    delete: ({ req: { user } }) => user?.role === "admin",
    admin: ({ req: { user } }) => user?.role === "admin",
  },
  fields: [
    {
      name: "id",
      type: "text",
      required: true,
      admin: {
        hidden: true,
      },
    },
    {
      name: "name",
      type: "text",
      required: true,
    },
    {
      name: "role",
      type: "select",
      defaultValue: "contributor",
      required: true,
      options: [
        { label: "Admin", value: "admin" },
        { label: "Editor", value: "editor" },
        { label: "Contributor", value: "contributor" },
      ],
      saveToJWT: true,
    },
  ],
};
