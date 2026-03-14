import { pgTable, uuid, varchar, text, timestamp, date, numeric, jsonb, boolean, pgEnum } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const utilityTypeEnum = pgEnum('utility_type', ['Electricity', 'Solar', 'Water', 'Sewerage', 'Assessment Rates', 'CID Levy']);
export const riskLevelEnum = pgEnum('risk_level', ['Low', 'Medium', 'High']);

export const buildings = pgTable('buildings', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: varchar('name', { length: 255 }).notNull(),
  address: text('address'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  municipalValue: numeric('municipal_value', { precision: 15, scale: 2 }),
});

export const buildingsRelations = relations(buildings, ({ many }) => ({
  utilityAccounts: many(utilityAccounts),
}));

export const utilityAccounts = pgTable('utility_accounts', {
  id: uuid('id').defaultRandom().primaryKey(),
  buildingId: uuid('building_id').references(() => buildings.id).notNull(),
  accountNumber: varchar('account_number', { length: 255 }).notNull(),
  type: utilityTypeEnum('type').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const utilityAccountsRelations = relations(utilityAccounts, ({ one }) => ({
  building: one(buildings, {
    fields: [utilityAccounts.buildingId],
    references: [buildings.id],
  }),
}));

export const invoices = pgTable('invoices', {
  id: uuid('id').defaultRandom().primaryKey(),
  utilityAccountId: uuid('utility_account_id').references(() => utilityAccounts.id).notNull(),
  billingPeriod: date('billing_period').notNull(),
  amount: numeric('amount', { precision: 12, scale: 2 }).notNull(),
  basicCharge: numeric('basic_charge', { precision: 12, scale: 2 }),
  usageCharge: numeric('usage_charge', { precision: 12, scale: 2 }),
  demandCharge: numeric('demand_charge', { precision: 12, scale: 2 }),
  usage: numeric('usage', { precision: 12, scale: 2 }),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const recoveries = pgTable('recoveries', {
  id: uuid('id').defaultRandom().primaryKey(),
  buildingId: uuid('building_id').references(() => buildings.id).notNull(),
  tenantName: varchar('tenant_name', { length: 255 }).notNull(),
  amountBilled: numeric('amount_billed', { precision: 12, scale: 2 }).notNull(),
  basicCharge: numeric('basic_charge', { precision: 12, scale: 2 }),
  usageCharge: numeric('usage_charge', { precision: 12, scale: 2 }),
  demandCharge: numeric('demand_charge', { precision: 12, scale: 2 }),
  solarProduced: numeric('solar_produced', { precision: 12, scale: 2 }),
  period: date('period').notNull(),
  pdfUrl: text('pdf_url'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const analysisReports = pgTable('analysis_reports', {
  id: uuid('id').defaultRandom().primaryKey(),
  buildingId: uuid('building_id').references(() => buildings.id).notNull(),
  period: date('period').notNull(),
  totalInvoiceAmount: numeric('total_invoice_amount', { precision: 12, scale: 2 }).notNull(),
  totalRecoveryAmount: numeric('total_recovery_amount', { precision: 12, scale: 2 }).notNull(),
  deficit: numeric('deficit', { precision: 12, scale: 2 }).notNull(),
  riskLevel: riskLevelEnum('risk_level').notNull(),
  anomaliesFound: jsonb('anomalies_found'),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const feedbackLoop = pgTable('feedback_loop', {
  id: uuid('id').defaultRandom().primaryKey(),
  analysisReportId: uuid('analysis_report_id').references(() => analysisReports.id).notNull(),
  fieldCorrected: varchar('field_corrected', { length: 255 }).notNull(),
  oldValue: text('old_value'),
  newValue: text('new_value'),
  userNotes: text('user_notes'),
  aiLearned: boolean('ai_learned').default(false).notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

export const appSettings = pgTable('app_settings', {
  id: uuid('id').defaultRandom().primaryKey(),
  chatModel: varchar('chat_model', { length: 255 }).default('gemini-3-flash').notNull(),
  analysisModel: varchar('analysis_model', { length: 255 }).default('gemini-3.1-pro').notNull(),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
});

// Payload managed tables (manually defined to force creation via Drizzle)
export const users = pgTable('users', {
  id: uuid('id').defaultRandom().primaryKey(),
  name: text('name').notNull(),
  email: varchar('email', { length: 255 }).notNull().unique(),
  resetPasswordToken: text('reset_password_token'),
  resetPasswordExpiration: timestamp('reset_password_expiration'),
  salt: text('salt'),
  hash: text('hash'),
  loginAttempts: numeric('login_attempts'),
  lockUntil: timestamp('lock_until'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const media = pgTable('media', {
  id: uuid('id').defaultRandom().primaryKey(),
  alt: text('alt').notNull(),
  url: text('url'),
  filename: text('filename'),
  mimeType: text('mime_type'),
  filesize: numeric('filesize'),
  width: numeric('width'),
  height: numeric('height'),
  updatedAt: timestamp('updated_at').defaultNow().notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const usersSessions = pgTable('users_sessions', {
  id: text('id').primaryKey(),
  parentId: uuid('_parent_id').references(() => users.id).notNull(),
  order: numeric('_order').notNull(),
  createdAt: timestamp('created_at').defaultNow().notNull(),
  expiresAt: timestamp('expires_at').notNull(),
});
