# semantic-release-monorepo

A semantic-release plugin to update version for multi-lingual mono repository structure.

| Step               | Description                                                                                                                                                                    |
| ------------------ | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `verifyConditions` | Verifies the plugin configuration.                                                                                                                                             |
| `prepare`          | Update the version in main package as well as dependencies in files based on type. Updates version in `package.json` file for `yarn` and `npm` types, `pom.xml` for maven type |

## Install

```bash
$ npm install https://github.com/SoftwareAG/semantic-release-monorepo/releases/download/v1.0.3/semantic-release-monorepo-1.0.3.tgz  -D
```

## Usage

The plugin can be configured in the [**semantic-release** configuration file](https://github.com/semantic-release/semantic-release/blob/master/docs/usage/configuration.md#configuration):

```json
{
  "plugins": [
    "@semantic-release/commit-analyzer",
    "@semantic-release/release-notes-generator",
    "semantic-release-monorepo"
  ]
}
```

## Configuration

### Options

| Options   | Description                                                                                                                                                                                                                 | Default |
| --------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------- |
| `type`    | Package manager type for the project. Supported types: `yarn`, `npm`, `maven`, `yarn-berry`                                                                                                                                 | `yarn`  |
| `pkgRoot` | **Mandatory**. Project root folder. Can be absolute or relative to the main project. <br/> **Note**: The `pkgRoot` directory must contain a `package.json` for `yarn` or `npm` project and a `pom.xml` for `maven` project. |         |

### Supported package types

At the moment, updating version is supported only for yarn, npm and maven projects.

### Examples

### Example: Multi-lingual Project with Dependencies in Separate Workspaces

For a project with dependencies implemented in different programming languages, you can use the following example to create the plugin configuration.

The project structure consists of a web application as the main project, with a `release.config.js` file at its root for semantic-release configuration. The dependencies projects, `api` and `common`, are located in the `backend/java` folder and `web-api` is located in the `backend/node` folder. When semantic release is triggered from the `webapp` project, the versions of all the packages - `webapp`, `api`,`common`, and `web-api` - will be updated to the next version.

#### Repository structure

```
repo-root-directory
 |-webapp
 |--package.json
 |--release.config.js
 |--styles
 |--- main.css
 |-- README.md
 |-- index.html
 |-backend
 |--java
 |---api
 |----pom.xml
 |----src
 |---common
 |----pom.xml
 |----src
 |--node
 |---web-api
 |----package.json
 |----src

```

The `pluginConfig` when semantic release is run from `webapp` project

```json
{
  "type": "yarn",
  "dependencies": [
    {
      "pkgRoot": "../backend/java/api",
      "type": "maven"
    },
    {
      "pkgRoot": "../backend/java/common",
      "type": "maven"
    },
    {
      "pkgRoot": "../backend/node/web-api",
      "type": "npm"
    }
  ]
}
```

**Important** : If the main project is maven, ensure to install semantic-release and other plugins globally.

```bash
$ npm install -g semantic-release https://github.com/SoftwareAG/semantic-release-monorepo/releases/download/v1.0.3/semantic-release-monorepo-1.0.3.tgz
```

For the project structure as below, add the semantic-release configuration file and run semantic-release from the project root folder

```
|-repo-root
 |--java
 |---api
 |----pom.xml
 |----release.config.js
 |----src
 |---common
 |----pom.xml
 |----src

```

the `pluginConfiguration` in release.config.js is

```json
{
    "type":"maven"
    "dependencies":[
        {
            "pkgRoot": "../common",
            "type": "maven"
        }
    ]
}
```

For projects with `yarn >1.22.22`, use the type `yarn-berry`

```json
{
  "type": "yarn-berry"
}
```
