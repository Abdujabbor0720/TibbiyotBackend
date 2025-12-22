import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitialSchema1704067200000 implements MigrationInterface {
  name = 'InitialSchema1704067200000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    // Create enums
    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "language_enum" AS ENUM ('uz', 'ru', 'en');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "user_role_enum" AS ENUM ('student', 'contact_person', 'admin', 'super_admin');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "media_type_enum" AS ENUM ('image', 'video', 'audio', 'document');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "news_status_enum" AS ENUM ('draft', 'published', 'archived');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "broadcast_status_enum" AS ENUM ('pending', 'sending', 'completed', 'failed', 'cancelled');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "conversation_status_enum" AS ENUM ('active', 'closed');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    await queryRunner.query(`
      DO $$ BEGIN
        CREATE TYPE "message_sender_type_enum" AS ENUM ('student', 'contact_person');
      EXCEPTION
        WHEN duplicate_object THEN null;
      END $$;
    `);

    // Create users table
    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "telegram_id" bigint NOT NULL,
        "username" character varying,
        "first_name" character varying NOT NULL,
        "last_name" character varying,
        "language" "language_enum" NOT NULL DEFAULT 'uz',
        "role" "user_role_enum" NOT NULL DEFAULT 'student',
        "is_active" boolean NOT NULL DEFAULT true,
        "is_profile_complete" boolean NOT NULL DEFAULT false,
        "phone_number" character varying,
        "last_active_at" TIMESTAMP WITH TIME ZONE,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_users_telegram_id" UNIQUE ("telegram_id"),
        CONSTRAINT "PK_users" PRIMARY KEY ("id")
      )
    `);

    // Create contacts table
    await queryRunner.query(`
      CREATE TABLE "contacts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "user_id" uuid,
        "name_uz" character varying(255) NOT NULL,
        "name_ru" character varying(255) NOT NULL,
        "name_en" character varying(255) NOT NULL,
        "position_uz" character varying(255) NOT NULL,
        "position_ru" character varying(255) NOT NULL,
        "position_en" character varying(255) NOT NULL,
        "department_uz" character varying(255),
        "department_ru" character varying(255),
        "department_en" character varying(255),
        "photo_url" character varying(500),
        "display_order" integer NOT NULL DEFAULT 0,
        "is_active" boolean NOT NULL DEFAULT true,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_contacts" PRIMARY KEY ("id")
      )
    `);

    // Create media_assets table
    await queryRunner.query(`
      CREATE TABLE "media_assets" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "file_name" character varying(255) NOT NULL,
        "original_name" character varying(255) NOT NULL,
        "mime_type" character varying(100) NOT NULL,
        "size" integer NOT NULL,
        "type" "media_type_enum" NOT NULL,
        "storage_key" character varying(500) NOT NULL,
        "url" character varying(500) NOT NULL,
        "thumbnail_url" character varying(500),
        "telegram_file_id" character varying(255),
        "checksum" character varying(64),
        "metadata" jsonb DEFAULT '{}',
        "uploaded_by_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_media_assets_storage_key" UNIQUE ("storage_key"),
        CONSTRAINT "PK_media_assets" PRIMARY KEY ("id")
      )
    `);

    // Create news_posts table
    await queryRunner.query(`
      CREATE TABLE "news_posts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title_uz" character varying(500) NOT NULL,
        "title_ru" character varying(500) NOT NULL,
        "title_en" character varying(500) NOT NULL,
        "content_uz" text NOT NULL,
        "content_ru" text NOT NULL,
        "content_en" text NOT NULL,
        "excerpt_uz" character varying(500),
        "excerpt_ru" character varying(500),
        "excerpt_en" character varying(500),
        "status" "news_status_enum" NOT NULL DEFAULT 'draft',
        "view_count" integer NOT NULL DEFAULT 0,
        "is_pinned" boolean NOT NULL DEFAULT false,
        "published_at" TIMESTAMP WITH TIME ZONE,
        "author_id" uuid,
        "cover_image_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_news_posts" PRIMARY KEY ("id")
      )
    `);

    // Create conversations table
    await queryRunner.query(`
      CREATE TABLE "conversations" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "student_id" uuid NOT NULL,
        "contact_id" uuid NOT NULL,
        "status" "conversation_status_enum" NOT NULL DEFAULT 'active',
        "last_message_at" TIMESTAMP WITH TIME ZONE,
        "student_unread_count" integer NOT NULL DEFAULT 0,
        "contact_unread_count" integer NOT NULL DEFAULT 0,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "UQ_conversations_student_contact" UNIQUE ("student_id", "contact_id"),
        CONSTRAINT "PK_conversations" PRIMARY KEY ("id")
      )
    `);

    // Create messages table
    await queryRunner.query(`
      CREATE TABLE "messages" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "conversation_id" uuid NOT NULL,
        "sender_type" "message_sender_type_enum" NOT NULL,
        "sender_id" uuid NOT NULL,
        "encrypted_content" text NOT NULL,
        "iv" character varying(32) NOT NULL,
        "auth_tag" character varying(32) NOT NULL,
        "has_attachment" boolean NOT NULL DEFAULT false,
        "attachment_type" "media_type_enum",
        "attachment_file_id" character varying(255),
        "is_read" boolean NOT NULL DEFAULT false,
        "read_at" TIMESTAMP WITH TIME ZONE,
        "telegram_message_id" integer,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_messages" PRIMARY KEY ("id")
      )
    `);

    // Create broadcasts table
    await queryRunner.query(`
      CREATE TABLE "broadcasts" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "title" character varying(255) NOT NULL,
        "message_uz" text NOT NULL,
        "message_ru" text NOT NULL,
        "message_en" text NOT NULL,
        "media_id" uuid,
        "status" "broadcast_status_enum" NOT NULL DEFAULT 'pending',
        "target_roles" "user_role_enum"[] NOT NULL DEFAULT '{student}',
        "total_recipients" integer NOT NULL DEFAULT 0,
        "sent_count" integer NOT NULL DEFAULT 0,
        "failed_count" integer NOT NULL DEFAULT 0,
        "scheduled_at" TIMESTAMP WITH TIME ZONE,
        "started_at" TIMESTAMP WITH TIME ZONE,
        "completed_at" TIMESTAMP WITH TIME ZONE,
        "created_by_id" uuid,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_broadcasts" PRIMARY KEY ("id")
      )
    `);

    // Create audit_logs table
    await queryRunner.query(`
      CREATE TABLE "audit_logs" (
        "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
        "admin_id" uuid NOT NULL,
        "action" character varying(100) NOT NULL,
        "entity_type" character varying(50) NOT NULL,
        "entity_id" uuid,
        "old_values" jsonb,
        "new_values" jsonb,
        "ip_address" character varying(45),
        "user_agent" text,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_audit_logs" PRIMARY KEY ("id")
      )
    `);

    // Create bot_sessions table
    await queryRunner.query(`
      CREATE TABLE "bot_sessions" (
        "id" character varying(255) NOT NULL,
        "session_data" text NOT NULL,
        "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
        CONSTRAINT "PK_bot_sessions" PRIMARY KEY ("id")
      )
    `);

    // Create junction table for news_posts_media_assets
    await queryRunner.query(`
      CREATE TABLE "news_posts_media_assets" (
        "news_post_id" uuid NOT NULL,
        "media_asset_id" uuid NOT NULL,
        CONSTRAINT "PK_news_posts_media_assets" PRIMARY KEY ("news_post_id", "media_asset_id")
      )
    `);

    // Add foreign keys
    await queryRunner.query(`
      ALTER TABLE "contacts"
      ADD CONSTRAINT "FK_contacts_user"
      FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "media_assets"
      ADD CONSTRAINT "FK_media_assets_uploaded_by"
      FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "news_posts"
      ADD CONSTRAINT "FK_news_posts_author"
      FOREIGN KEY ("author_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "news_posts"
      ADD CONSTRAINT "FK_news_posts_cover_image"
      FOREIGN KEY ("cover_image_id") REFERENCES "media_assets"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "conversations"
      ADD CONSTRAINT "FK_conversations_student"
      FOREIGN KEY ("student_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "conversations"
      ADD CONSTRAINT "FK_conversations_contact"
      FOREIGN KEY ("contact_id") REFERENCES "contacts"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "messages"
      ADD CONSTRAINT "FK_messages_conversation"
      FOREIGN KEY ("conversation_id") REFERENCES "conversations"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "broadcasts"
      ADD CONSTRAINT "FK_broadcasts_media"
      FOREIGN KEY ("media_id") REFERENCES "media_assets"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "broadcasts"
      ADD CONSTRAINT "FK_broadcasts_created_by"
      FOREIGN KEY ("created_by_id") REFERENCES "users"("id") ON DELETE SET NULL
    `);

    await queryRunner.query(`
      ALTER TABLE "audit_logs"
      ADD CONSTRAINT "FK_audit_logs_admin"
      FOREIGN KEY ("admin_id") REFERENCES "users"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "news_posts_media_assets"
      ADD CONSTRAINT "FK_news_posts_media_assets_news_post"
      FOREIGN KEY ("news_post_id") REFERENCES "news_posts"("id") ON DELETE CASCADE
    `);

    await queryRunner.query(`
      ALTER TABLE "news_posts_media_assets"
      ADD CONSTRAINT "FK_news_posts_media_assets_media_asset"
      FOREIGN KEY ("media_asset_id") REFERENCES "media_assets"("id") ON DELETE CASCADE
    `);

    // Create indexes for performance
    await queryRunner.query(`CREATE INDEX "IDX_users_telegram_id" ON "users" ("telegram_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_role" ON "users" ("role")`);
    await queryRunner.query(`CREATE INDEX "IDX_users_is_active" ON "users" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_contacts_display_order" ON "contacts" ("display_order")`);
    await queryRunner.query(`CREATE INDEX "IDX_contacts_is_active" ON "contacts" ("is_active")`);
    await queryRunner.query(`CREATE INDEX "IDX_news_posts_status" ON "news_posts" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_news_posts_published_at" ON "news_posts" ("published_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_news_posts_is_pinned" ON "news_posts" ("is_pinned")`);
    await queryRunner.query(`CREATE INDEX "IDX_conversations_student_id" ON "conversations" ("student_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_conversations_contact_id" ON "conversations" ("contact_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_conversations_status" ON "conversations" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_messages_conversation_id" ON "messages" ("conversation_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_messages_created_at" ON "messages" ("created_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_broadcasts_status" ON "broadcasts" ("status")`);
    await queryRunner.query(`CREATE INDEX "IDX_broadcasts_scheduled_at" ON "broadcasts" ("scheduled_at")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_admin_id" ON "audit_logs" ("admin_id")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_action" ON "audit_logs" ("action")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_entity_type" ON "audit_logs" ("entity_type")`);
    await queryRunner.query(`CREATE INDEX "IDX_audit_logs_created_at" ON "audit_logs" ("created_at")`);

    // Enable uuid-ossp extension
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS "uuid-ossp"`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    // Drop indexes
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_entity_type"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_action"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_audit_logs_admin_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_broadcasts_scheduled_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_broadcasts_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_created_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_messages_conversation_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_conversations_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_conversations_contact_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_conversations_student_id"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_news_posts_is_pinned"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_news_posts_published_at"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_news_posts_status"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contacts_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_contacts_display_order"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_is_active"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_role"`);
    await queryRunner.query(`DROP INDEX IF EXISTS "IDX_users_telegram_id"`);

    // Drop foreign keys and tables
    await queryRunner.query(`DROP TABLE IF EXISTS "news_posts_media_assets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "bot_sessions"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "audit_logs"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "broadcasts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "messages"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "conversations"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "news_posts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "media_assets"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "contacts"`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users"`);

    // Drop enums
    await queryRunner.query(`DROP TYPE IF EXISTS "message_sender_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "conversation_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "broadcast_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "news_status_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "media_type_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum"`);
    await queryRunner.query(`DROP TYPE IF EXISTS "language_enum"`);
  }
}
