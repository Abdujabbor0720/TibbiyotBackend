const { DataSource } = require('typeorm');
require('dotenv').config();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  const isRemote = databaseUrl && databaseUrl.includes('render.com');
  
  const config = databaseUrl 
    ? {
        type: 'postgres',
        url: databaseUrl,
        ssl: isRemote ? { rejectUnauthorized: false } : false,
      }
    : {
        type: 'postgres',
        host: process.env.DATABASE_HOST || 'localhost',
        port: parseInt(process.env.DATABASE_PORT) || 5432,
        database: process.env.DATABASE_NAME || 'eski_tashmi',
        username: process.env.DATABASE_USER || 'postgres',
        password: process.env.DATABASE_PASSWORD || 'password',
        ssl: false,
      };
  
  console.log('Connecting to database...');
  const dataSource = new DataSource(config);

  await dataSource.initialize();
  console.log('Connected!');
  
  // Insert migration records for already applied migrations
  await dataSource.query(`
    INSERT INTO migrations (timestamp, name) 
    VALUES 
      (1704067200000, 'InitialSchema1704067200000'),
      (1704067200001, 'AddMediaUrlsToNewsPost1704067200001')
    ON CONFLICT DO NOTHING
  `);
  
  console.log('Migration records inserted successfully');
  
  // Add English columns to news_posts if not exists
  await dataSource.query(`
    ALTER TABLE news_posts 
    ADD COLUMN IF NOT EXISTS "titleEn" text,
    ADD COLUMN IF NOT EXISTS "bodyEn" text
  `);
  
  console.log('English columns added to news_posts');
  
  await dataSource.destroy();
}

main().catch(console.error);
