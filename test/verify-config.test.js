import { jest } from '@jest/globals';
import { temporaryDirectory } from 'tempy';
import { mkdirp } from 'fs-extra';

describe('Test verify-config errors', () => {
  let isTypeInstalledMock;
  let pathExistsMock;
  let verifyConfigModule;
  let loggerMock;
  beforeAll(async () => {
    isTypeInstalledMock = jest.fn(async () => {
      console.log('type check mock called');
      return true;
    });
    pathExistsMock = jest.fn(async () => {
      console.log('path check mock called');
      return true;
    });
    loggerMock = { log: jest.fn() };
    const originalModule = await import('../lib/util.js');
    jest.unstable_mockModule('../lib/util.js', async () => {
      return {
        __esModule: true,
        ...originalModule,
        isTypeInstalled: isTypeInstalledMock,
        pathExists: pathExistsMock
      };
    });
    await import('../lib/util.js');
    verifyConfigModule = await import('../lib/verify-config.js');
  });

  test('should return error if type is not supported', async () => {
    const pluginConfig = {
      type: 'invalid'
    };
    const context = {
      logger: loggerMock,
      cwd: '/test'
    };
    const errors = await verifyConfigModule.default(pluginConfig, context);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('EINVALIDTYPE');
    expect(errors[0].message).toBe('Invalid package type option: invalid');
  });

  test('should return error if type is not installed', async () => {
    const pluginConfig = {
      type: 'yarn'
    };
    const context = {
      logger: loggerMock,
      cwd: '/test'
    };
    isTypeInstalledMock.mockImplementationOnce(async () => {
      console.log('type check mock called within test');
      return false;
    });
    const errors = await verifyConfigModule.default(pluginConfig, context);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('ETYPENOTINSTALLED');
    expect(errors[0].message).toBe('yarn is not installed');
  });

  test('should return error if dependency is not an array', async () => {
    const pluginConfig = {
      dependencies: 'invalid'
    };
    const context = {
      logger: loggerMock,
      cwd: '/test'
    };
    const errors = await verifyConfigModule.default(pluginConfig, context);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('EINVALIDDEPENDENCY');
    expect(errors[0].message).toBe('Invalid dependency list');
  });

  test('should return error if dependency pkgRoot is not defined', async () => {
    const pluginConfig = {
      dependencies: [
        {
          type: 'yarn'
        }
      ]
    };
    const context = {
      logger: loggerMock,
      cwd: '/test'
    };
    const errors = await verifyConfigModule.default(pluginConfig, context);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('EINVALIDPKGROOT');
    expect(errors[0].message).toBe('Invalid package root: undefined');
  });

  test('should return error if dependency pkgRoot is invalid', async () => {
    const pluginConfig = {
      dependencies: [
        {
          pkgRoot: '/invalid',
          type: 'yarn'
        }
      ]
    };
    const context = {
      logger: loggerMock,
      cwd: '/test'
    };
    pathExistsMock.mockImplementationOnce(async () => {
      console.log('path check mock called within test');
      return false;
    });
    const errors = await verifyConfigModule.default(pluginConfig, context);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('EINVALIDPKGROOT');
    expect(errors[0].message).toBe('Invalid package root: /invalid');
  });

  test('should return error if dependency type is not supported', async () => {
    const pluginConfig = {
      dependencies: [
        {
          pkgRoot: 'valid/path',
          type: 'invalid'
        }
      ]
    };
    const context = {
      logger: loggerMock,
      cwd: '/test'
    };

    const errors = await verifyConfigModule.default(pluginConfig, context);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('EINVALIDTYPE');
    expect(errors[0].message).toBe('Invalid package type option: invalid');
  });

  test('should return error if dependency type is not installed', async () => {
    const pluginConfig = {
      dependencies: [
        {
          pkgRoot: 'valid/path',
          type: 'yarn'
        }
      ]
    };
    const context = {
      logger: loggerMock,
      cwd: '/test'
    };
    isTypeInstalledMock.mockImplementationOnce(async () => {
      console.log('type check mock called within test');
      return false;
    });
    const errors = await verifyConfigModule.default(pluginConfig, context);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('ETYPENOTINSTALLED');
    expect(errors[0].message).toBe('yarn is not installed');
  });

  test('should return error if type is empty', async () => {
    const pluginConfig = {
      type: ''
    };
    const context = {
      logger: loggerMock,
      cwd: '/test'
    };
    const errors = await verifyConfigModule.default(pluginConfig, context);
    expect(errors.length).toBe(1);
    expect(errors[0].code).toBe('EINVALIDTYPE');
    expect(errors[0].message).toBe('Invalid package type option: ');
  });

  test('should return multiple errors', async () => {
    const pluginConfig = {
      dependencies: [
        {
          pkgRoot: 'valid/path',
          type: 'invalid'
        },
        {
          pkgRoot: '/invalid',
          type: 'yarn'
        }
      ]
    };
    const context = {
      logger: loggerMock,
      cwd: '/test'
    };

    pathExistsMock
      .mockImplementationOnce(async () => {
        console.log('path check mock called within test');
        return true;
      })
      .mockImplementationOnce(async () => {
        console.log('path check mock called within test');
        return false;
      });

    const errors = await verifyConfigModule.default(pluginConfig, context);
    console.log(errors);
    expect(errors.length).toBe(2);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });
});

describe('Test verify-config success', () => {
  let verifyConfigModule;
  let loggerMock;
  beforeAll(async () => {
    verifyConfigModule = await import('../lib/verify-config.js');
    loggerMock = { log: jest.fn() };
  });

  test('should return empty array if config is valid', async () => {
    const cwd = temporaryDirectory();
    mkdirp(`${cwd}/yarn`);
    mkdirp(`${cwd}/maven`);
    mkdirp(`${cwd}/npm`);
    const pluginConfig = {
      dependencies: [
        {
          pkgRoot: `${cwd}/yarn`,
          type: 'yarn'
        },
        {
          pkgRoot: `./maven`,
          type: 'maven'
        }
      ]
    };
    const context = {
      logger: loggerMock,
      cwd: cwd
    };
    const errors = await verifyConfigModule.default(pluginConfig, context);
    expect(errors.length).toBe(0);
  });
});
