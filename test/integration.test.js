import { jest } from '@jest/globals';
import { verifyConditions, prepare } from '../index.js';
import { WritableStreamBuffer } from 'stream-buffers';
import AggregateError from 'aggregate-error';
import SemanticReleaseError from '@semantic-release/error';
import { temporaryDirectory } from 'tempy';
import { copyFixturesToTempDir, getVersion } from './helpers/util.js';

describe('Integration', () => {
  let loggerMock;
  let stdout;
  let stderr;
  const testTimeout = 10000; // 10 seconds

  beforeAll(() => {
    loggerMock = {
      log: jest.fn()
    };
    stderr = new WritableStreamBuffer();
    stdout = new WritableStreamBuffer();
  });

  test('should throw error when config is invalid', async () => {
    const pluginConfig = { type: 'invalid' };
    const context = { logger: loggerMock, stderr, stdout };
    try {
      await verifyConditions(pluginConfig, context);
    } catch (ex) {
      expect(ex).toBeInstanceOf(AggregateError);
      const errors = Array.from(ex);
      expect(errors.length).toBe(1);
      expect(errors[0]).toBeInstanceOf(SemanticReleaseError);
      expect(errors[0].message).toBe('Invalid package type option: invalid');
    }
  });

  test('should not throw any error when no plugin configuration is provided', async () => {
    const pluginConfig = {};
    const context = { logger: loggerMock, stderr, stdout };
    await expect(async () => {
      await verifyConditions(pluginConfig, context);
    }).not.toThrow();
  });

  test(
    'should update versions in files in the main package when no pluginConfig is provided',
    async () => {
      const cwd = temporaryDirectory();
      await copyFixturesToTempDir('./test/fixtures/integration-test-02', cwd);
      const version = '1.2.0';
      const env = {};
      await prepare({}, { nextRelease: { version }, logger: loggerMock, cwd, stderr, stdout, env });
      expect(await getVersion('yarn', `${cwd}/package.json`)).toBe(version);
    },
    testTimeout
  );
});
