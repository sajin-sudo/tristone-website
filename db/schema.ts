import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const websiteContent=sqliteTable('website_content',{id:integer('id').primaryKey(),content:text('content').notNull(),revision:integer('revision').notNull(),updatedAt:text('updated_at').notNull(),updatedBy:text('updated_by').notNull()});
export const securityCounters=sqliteTable('security_counters',{id:text('id').primaryKey(),used:integer('used').notNull(),expires:integer('expires').notNull()});
export const securityNonces=sqliteTable('security_nonces',{id:text('id').primaryKey(),expires:integer('expires').notNull()});
export const adminSessions=sqliteTable('admin_sessions',{id:text('id').primaryKey(),expires:integer('expires').notNull()});
