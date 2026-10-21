import { captureApp } from './capture';

const BASE_URL = process.env.SOURCE_URL ?? 'http://localhost:9000';

captureApp({ id: 'source', baseUrl: BASE_URL }).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
