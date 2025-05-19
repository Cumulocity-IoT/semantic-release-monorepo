import { copy } from 'fs-extra';
import { XMLParser } from 'fast-xml-parser';
import { promises as fsPromises } from 'fs';

export const copyFixturesToTempDir = async (source, target) => {
  await copy(source, target);
};

export const getVersion = async (type, filePath) => {
  const fileContent = await fsPromises.readFile(filePath, 'utf8');
  let version;
  switch (type) {
    case 'yarn':
    case 'npm':
    case 'yarn-berry':
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
};

export const getMavenPropertyValue = async (filePath, propertyName) => {
  const fileContent = await fsPromises.readFile(filePath, 'utf8');
  const parser = new XMLParser();
  const pomJson = parser.parse(fileContent);
  const properties = pomJson.project.properties;
  if (properties && properties[propertyName]) {
    return properties[propertyName];
  }
};
