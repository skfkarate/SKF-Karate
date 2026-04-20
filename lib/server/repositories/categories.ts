import { resolveDataFile, readJsonArray, writeJsonAtomically } from '../data-store';
import { EVENT_TYPES_LIST } from '../../../data/constants/categories';

const CATEGORIES_DATA_FILE = resolveDataFile('categories.json');

const DEFAULT_CATEGORIES = [...EVENT_TYPES_LIST];

let categories: string[] = [];
let categoriesLoaded = false;

function ensureLoaded() {
  if (categoriesLoaded) return;
  categoriesLoaded = true;
  try {
    const stored = readJsonArray(CATEGORIES_DATA_FILE);
    if (stored) {
      categories = stored as string[];
    } else {
      categories = [...DEFAULT_CATEGORIES];
    }
  } catch(e) {
    categories = [...DEFAULT_CATEGORIES];
  }
}

export function getAllCategories() {
  ensureLoaded();
  return [...categories];
}

export function addCategory(category: string) {
  ensureLoaded();
  const trimmed = category.trim().toLowerCase().replace(/\s+/g, '-');
  if (trimmed && !categories.includes(trimmed)) {
    categories.push(trimmed);
    writeJsonAtomically(CATEGORIES_DATA_FILE, categories);
  }
  return [...categories];
}
