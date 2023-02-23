/**
 * For an array of `values`, computes the list of
 * duplicated keys.
 */
function findDuplicateKeys(values, extractKey) {
  const alreadySeenKeys = new Set();
  const duplicateKeys = [];
  for (let v of values) {
    const k = extractKey(v);
    if (alreadySeenKeys.has(k)) {
      duplicateKeys.push(k);
    }
    alreadySeenKeys.add(k);
  }
  return duplicateKeys;
}

class DuplicateHeading {
  constructor(fullPath) {
    this.fullPath = fullPath;
  }
  toString() {
    return this.fullPath.map((x) => `"${x}"`).join(" -> ");
  }
}

/**
 * Recursive helper for listing duplicate headings.
 *
 * Traverses all example definitions in-depth,
 * checks that in every (sub*)-section, all the
 * headings are unique.
 *
 * Returs a list of DuplicateHeading instances
 * that contain the full paths to the problematic headings.
 */
function findDuplicateHeadingsRec(structure, properties, currPath) {
  if (properties.length === 0) {
    return [];
  } else {
    const substructuresListName = properties[0];
    const substructuresList = structure[substructuresListName];
    const currentLevelDuplicates = findDuplicateKeys(
      substructuresList,
      (s) => s.heading
    ).map((k) => new DuplicateHeading([...currPath, k]));
    const lowerLevelDuplicates = substructuresList.flatMap((s) =>
      findDuplicateHeadingsRec(s, properties.slice(1), [...currPath, s.heading])
    );
    return [...currentLevelDuplicates, ...lowerLevelDuplicates];
  }
}

function findDuplicateHeadings(exampleCategories) {
  const rootStructure = {
    categories: exampleCategories,
  };
  return findDuplicateHeadingsRec(
    rootStructure,
    ["categories", "examples", "handlers"],
    []
  );
}

module.exports = {
  findDuplicateHeadings,
};
