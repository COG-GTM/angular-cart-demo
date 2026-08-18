import { captureApp } from './capture';

const BASE_URL = process.env.REACT_URL ?? 'http://localhost:4173';

captureApp({ id: 'react', baseUrl: BASE_URL }).catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
