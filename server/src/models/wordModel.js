import { readFileSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const dataFilePath = join(__dirname, '../../data/a1_verbs.json');

export const getVerbs = () => {
  return JSON.parse(readFileSync(dataFilePath, 'utf-8'));
};
