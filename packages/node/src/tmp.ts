import { createHash } from 'node:crypto';
import { mkdtemp, open, rmdir, unlink } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

async function createTmpDirectory() {
  const path = await mkdtemp(join(tmpdir(), 'directus-'));

  async function cleanup() {
    return await rmdir(path);
  }

  return {
    path,
    cleanup,
  };
}

export async function createTmpFile() {
  const dir = await createTmpDirectory();
  const filename = createHash('sha1')
    .update(new Date().toString())
    .digest('hex')
    .substring(0, 8);
  const path = join(dir.path, filename);

  try {
    const fd = await open(path, 'wx');
    await fd.close();
  } catch (err) {
    await dir.cleanup();
    throw err;
  }

  async function cleanup() {
    await unlink(path);
    await dir.cleanup();
  }

  return {
    path,
    cleanup,
  };
}
