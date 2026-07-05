const fs = require('fs');
const path = require('path');

const { ensureDirectory } = require('../../src/middleware/upload');

describe('upload middleware helpers', () => {
  const tempDir = path.join(__dirname, '..', '..', 'tmp-upload-test');

  afterEach(() => {
    fs.rmSync(tempDir, { recursive: true, force: true });
  });

  it('creates the target directory recursively before storing uploads', () => {
    ensureDirectory(tempDir);

    expect(fs.existsSync(tempDir)).toBe(true);
    expect(fs.statSync(tempDir).isDirectory()).toBe(true);
  });
});
