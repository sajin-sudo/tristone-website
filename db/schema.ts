import {sqliteTable,text,integer} from 'drizzle-orm/sqlite-core';
export const websiteContent=sqliteTable('website_content',{id:integer('id').primaryKey(),content:text('content').notNull(),revision:integer('revision').notNull(),updatedAt:text('updated_at').notNull(),updatedBy:text('updated_by').notNull()});
