import { jest } from '@jest/globals';
import { temporaryDirectory } from 'tempy';
import preparePackage from '../lib/prepare';
import { copyFixturesToTempDir, getVersion } from './helpers/util.js';
import { WritableStreamBuffer } from 'stream-buffers';

describe('prepare', () => {
  let loggerMock;
  let stderr;
  let stdout;
  let env;
  const version = '1.2.0';
  const testTimeout = 10000; // 10 seconds
  beforeAll(() => {
    loggerMock = {
      log: jest.fn()
    };
    stderr = new WritableStreamBuffer();
    stdout = new WritableStreamBuffer();
    env = {};
  });
  test(
    'should update versions in files for all supported types',
    async () => {
      const cwd = temporaryDirectory();
      await copyFixturesToTempDir('./test/fixtures/prepare-test-01', cwd);
      const yarnDependencyPkgRoot = `${cwd}/yarn-project`;
      const npmDependencyPkgRoot = `${cwd}/npm-project`;
      const mavenDependencyPkgRoot = `${cwd}/maven-project`;
      const dependencies = [
        { type: 'yarn', pkgRoot: yarnDependencyPkgRoot },
        { type: 'npm', pkgRoot: './npm-project' },
        { type: 'maven', pkgRoot: mavenDependencyPkgRoot }
      ];

      await preparePackage(
        { dependencies },
        { nextRelease: { version }, logger: loggerMock, cwd, stderr, stdout, env }
      );
      expect(await getVersion('yarn', `${cwd}/package.json`)).toBe(version);
      expect(await getVersion('yarn', `${yarnDependencyPkgRoot}/package.json`)).toBe(version);
      expect(await getVersion('npm', `${npmDependencyPkgRoot}/package.json`)).toBe(version);
      expect(await getVersion('maven', `${mavenDependencyPkgRoot}/pom.xml`)).toBe(version);
    },
    testTimeout
  );

  test(
    'should update version when the main package is maven project',
    async () => {
      const cwd = temporaryDirectory();
      await copyFixturesToTempDir('./test/fixtures/prepare-test-02', cwd);
      const pluginConfig = { type: 'maven' };
      await preparePackage(pluginConfig, {
        nextRelease: { version },
        logger: loggerMock,
        cwd,
        stderr,
        stdout,
        env
      });

      expect(await getVersion('maven', `${cwd}/pom.xml`)).toBe(version);
    },
    testTimeout
  );

  test(
    'should update version when the main package is npm project',
    async () => {
      const cwd = temporaryDirectory();
      await copyFixturesToTempDir('./test/fixtures/prepare-test-03', cwd);
      const pluginConfig = { type: 'npm' };
      await preparePackage(pluginConfig, {
        nextRelease: { version },
        logger: loggerMock,
        cwd,
        stderr,
        stdout,
        env
      });

      expect(await getVersion('npm', `${cwd}/package.json`)).toBe(version);
    },
    testTimeout
  );

  test(
    'should update version when the main package is yarn berry project',
    async () => {
      const cwd = temporaryDirectory();
      console.log(cwd);
      await copyFixturesToTempDir('./test/fixtures/prepare-test-04', cwd);
      const pluginConfig = { type: 'yarn-berry' };
      await preparePackage(pluginConfig, {
        nextRelease: { version },
        logger: loggerMock,
        cwd,
        stderr,
        stdout,
        env
      });
      expect(await getVersion('yarn-berry', `${cwd}/package.json`)).toBe(version);
    },
    testTimeout
  );
});
