import { captureApp } from './capture';

const SOURCE_URL = process.env.SOURCE_URL ?? 'http://localhost:9000';
const REACT_URL = process.env.REACT_URL ?? 'http://localhost:4173';

async function main(): Promise<void> {
  await captureApp({ id: 'source', baseUrl: SOURCE_URL });
  await captureApp({ id: 'react', baseUrl: REACT_URL });
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
