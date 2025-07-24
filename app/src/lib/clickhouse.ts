import { createClient } from '@clickhouse/client';

const client = createClient({
  url: process.env.CLICKHOUSE_URL || 'http://127.0.0.1:8123',
  username: process.env.CLICKHOUSE_USER || 'dev',
  password: process.env.CLICKHOUSE_PASSWORD || 'dev',
  database: 'gwarchivist'
});

export default client; 