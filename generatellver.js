/**
 *
 *
 * @export
 * @param {any} rootGenerator
 * @param {(gen:any)=>boolean} shouldGeneratorBeRemovedFn
 * @param {(genX:any,genY:any)=>boolean} isXABetterGeneratorThanYFn
 * @param {(id,gen)=>void} saveGeneratorFn
 * @param {(id)=>any} loadGeneratorFn
 * @param {(id)=>void} deleteGeneratorFn
 */
export async function initGenerators(
  rootGenerator,
  shouldGeneratorBeRemovedFn,
  isXABetterGeneratorThanYFn,
  saveGeneratorFn,
  loadGeneratorFn,
  deleteGeneratorFn
) {
  shouldGeneratorBeRemoved = shouldGeneratorBeRemovedFn;
  isXABetterGeneratorThanY = isXABetterGeneratorThanYFn;
  rootGenerator.id = nextGeneratorId;
  nextGeneratorId++;
  saveGenerator = saveGeneratorFn;
  loadGenerator = loadGeneratorFn;
  deleteGenerator = deleteGeneratorFn;
  await saveGeneratorWrapper(rootGenerator);
  firstGenerator = rootGenerator;
}

async function saveGeneratorWrapper(id, generator) {
  generator.lastSaveTime = Date.now();
  assert(id == generator.id);
  assert(id != null);
  await saveGenerator(id, generator);
}

export async function generate() {
  const generator = firstGenerator;
  const generated = generator.next().value;
  if (generated != null) {
    if (
      generator.lastSaveTime == null ||
      Date.now() - generator.lastSaveTime > 5000
    ) {
      await saveGeneratorWrapper(generator);
    }
    return generated;
  }
  if (firstGenerator.nextGeneratorId != null) {
    firstGenerator = await loadGenerator(firstGenerator.nextGeneratorId);
  }
  await deleteGenerator(generator.id);
  return null;
}

export async function removeUnwantedGenerators() {
  let generator = firstGenerator;
  let prevGenerator = null;
  while (generator != null) {
    const nextGenerator =
      generator.nextGeneratorId == null
        ? null
        : await loadGenerator(generator.nextGeneratorId);
    if (!shouldGeneratorBeRemoved(generator)) {
      prevGenerator = generator;
      generator = nextGenerator;
      continue;
    }
    if (prevGenerator != null) {
      prevGenerator.nextGeneratorId = generator.nextGeneratorId;
      await saveGeneratorWrapper(prevGenerator);
    }
    if (generator === firstGenerator) {
      firstGenerator = nextGenerator;
    }
    await deleteGenerator(generator.id);
    generator = nextGenerator;
  }
}

export async function addGenerator(generator) {
  if (firstGenerator == null) {
    firstGenerator = generator;
    numOfGenerators_++;
    return;
  }
  let possibleNextGenerator = firstGenerator;
  let possiblePrevGenerator = null;
  while (true) {
    if (
      possibleNextGenerator == null ||
      isXABetterGeneratorThanY(generator, possibleNextGenerator)
    ) {
      //Found the location to insert. So insert and exit.
      if (possiblePrevGenerator == null) {
        firstGenerator = generator;
      } else {
        possiblePrevGenerator.nextGeneratorId = generator.id;
        await saveGeneratorWrapper(possiblePrevGenerator);
      }
      generator.nextGeneratorId = possibleNextGenerator
        ? possibleNextGenerator.id
        : null;
      await saveGeneratorWrapper(generator);
      numOfGenerators_++;
      return;
    }
    possiblePrevGenerator = possibleNextGenerator;
    possibleNextGenerator =
      possibleNextGenerator.nextGeneratorId == null
        ? null
        : loadGenerator(possibleNextGenerator.nextGeneratorId);
  }
}

export function numOfGenerators() {
  return numOfGenerators_;
}

let shouldGeneratorBeRemoved;
let isXABetterGeneratorThanY;
let numOfGenerators_ = 1;
let nextGeneratorId = 0;
let saveGenerator;
let loadGenerator;
let deleteGenerator;
let firstGenerator;

// TODO: comment out calls to this once sure
function assert(x) {
  if (!x) throw new Error("assertion failed");
}
