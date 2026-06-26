import { Pool, type QueryResultRow } from 'pg';

const connectionString =
  process.env.DATABASE_URL ?? 'postgres://studyapp:studyapp@127.0.0.1:5433/studyapp_dev';

export const pool = new Pool({
  connectionString,
  max: 10,
  idleTimeoutMillis: 30000,
});

export async function query<R extends QueryResultRow = QueryResultRow>(
  sql: string,
  params: unknown[] = []
): Promise<R[]> {
  const res = await pool.query<R>(sql, params);
  return res.rows;
}
