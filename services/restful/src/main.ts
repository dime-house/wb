import { useFastify } from '@dime/rest';

const { startServer } = useFastify();

await startServer();
