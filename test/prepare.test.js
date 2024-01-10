import { jest } from '@jest/globals';
import { temporaryDirectory } from 'tempy';
import prepare from '../lib/prepare';
import { copy } from 'fs-extra';
import { XMLParser } from 'fast-xml-parser';
import { promises as fsPromises } from 'fs';
import { WritableStreamBuffer } from 'stream-buffers';

describe('prepare', () => {
  let loggerMock;
  let stderr;
  let stdout;
  let env;
  const version = '1.2.0';
  beforeAll(() => {
    loggerMock = {
      log: jest.fn()
    };
    stderr = new WritableStreamBuffer();
    stdout = new WritableStreamBuffer();
    env = {};
  });
  test('should update versions in files for all supported types', async () => {
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

    await prepare(
      { dependencies },
      { nextRelease: { version }, logger: loggerMock, cwd, stderr, stdout, env }
    );
    expect(await getVersion('yarn', `${cwd}/package.json`)).toBe(version);
    expect(await getVersion('yarn', `${yarnDependencyPkgRoot}/package.json`)).toBe(version);
    expect(await getVersion('npm', `${npmDependencyPkgRoot}/package.json`)).toBe(version);
    expect(await getVersion('maven', `${mavenDependencyPkgRoot}/pom.xml`)).toBe(version);
  });

  test('should update version when the main package is maven project', async () => {
    const cwd = temporaryDirectory();
    await copyFixturesToTempDir('./test/fixtures/prepare-test-02', cwd);
    const pluginConfig = { type: 'maven' };
    await prepare(pluginConfig, {
      nextRelease: { version },
      logger: loggerMock,
      cwd,
      stderr,
      stdout,
      env
    });

    expect(await getVersion('maven', `${cwd}/pom.xml`)).toBe(version);
  });

  test('should update version when the main package is npm project', async () => {
    const cwd = temporaryDirectory();
    await copyFixturesToTempDir('./test/fixtures/prepare-test-03', cwd);
    const pluginConfig = { type: 'npm' };
    await prepare(pluginConfig, {
      nextRelease: { version },
      logger: loggerMock,
      cwd,
      stderr,
      stdout,
      env
    });

    expect(await getVersion('npm', `${cwd}/package.json`)).toBe(version);
  });
});

// function to copy files from test/fixtures to temporary directory

async function copyFixturesToTempDir(source, target) {
  await copy(source, target);
}

async function getVersion(type, filePath) {
  const fileContent = await fsPromises.readFile(filePath, 'utf8');
  let version;
  switch (type) {
    case 'yarn':
    case 'npm':
      const packageJson = JSON.parse(fileContent);
      version = packageJson.version;
      break;
    case 'maven':
      const parser = new XMLParser();
      const pomJson = parser.parse(fileContent);
      version = pomJson.project.version;
      break;
  }
  return version;
}
