export async function initGenerators(
  rootGenerator,
  shouldGeneratorBeRemovedFn,
  isXABetterGeneratorThanYFn,
  newGeneratorsFn,
  isSpliceFast
) {
  shouldGeneratorBeRemoved = shouldGeneratorBeRemovedFn;
  isXABetterGeneratorThanY = isXABetterGeneratorThanYFn;
  newGenerators = newGeneratorsFn;
  if (newGenerators) {
    generators = newGenerators();
    await generators.push(rootGenerator);
  } else {
    generators = [rootGenerator];
  }
  isSpliceFast_ = isSpliceFast;
}

export async function generate() {
  const generator = await generators[0];
  const generated = generator.next().value;
  if (generated == null) {
    await generators.shift();
  }
  return generated;
}

export async function removeUnwantedGenerators() {
  if (!isSpliceFast_) {
    const newArray = newGenerators ? newGenerators() : [];
    const length = generators.length;
    for (let idx = 0; idx < length; idx++) {
      const generator = await generators[idx];
      if (!shouldGeneratorBeRemoved(generator)) {
        await newArray.push(generator);
      }
    }
    generators = newArray;
  } else {
    let idx = 0;
    while (idx < generators.length) {
      const generator = await generators[idx];
      if (shouldGeneratorBeRemoved(generator)) {
        await generators.splice(idx, 1);
        continue;
      }
      idx++;
    }
  }
}

export async function addGenerator(generator) {
  const len = generators.length;
  if (len == 0) {
    await generators.push(generator);
    return;
  }
  await addGenerator2(generator, 0, len - 1);
}

async function addGenerator2(
  generator,
  upperIndexInclusive,
  lowerIndexInclusive
) {
  while (true) {
    //assert(upperIndexInclusive<=lowerIndexInclusive)
    if (
      isXABetterGeneratorThanY(generator, await generators[upperIndexInclusive])
    ) {
      await generators.splice(upperIndexInclusive, 0, generator);
      return;
    }
    if (
      isXABetterGeneratorThanY(await generators[lowerIndexInclusive], generator)
    ) {
      await generators.splice(lowerIndexInclusive + 1, 0, generator);
      return;
    }
    if (upperIndexInclusive == lowerIndexInclusive) {
      // as good as each other, put the newest one after:
      await generators.splice(lowerIndexInclusive + 1, 0, generator);
      return;
    }
    let midIndexInclusive = Math.ceil(
      (upperIndexInclusive + lowerIndexInclusive) / 2
    );
    //--assert(upperIndexInclusive<midIndexInclusive)
    //--assert(midIndexInclusive<=lowerIndexInclusive)
    if (
      isXABetterGeneratorThanY(generator, await generators[midIndexInclusive])
    ) {
      lowerIndexInclusive = midIndexInclusive - 1;
      //assert(upperIndexInclusive<=lowerIndexInclusive)
      continue;
    }
    upperIndexInclusive = midIndexInclusive;
    //assert(upperIndexInclusive<=lowerIndexInclusive)
  }
}

export function numOfGenerators() {
  return generators.length;
}

let generators = [];
let shouldGeneratorBeRemoved;
let isXABetterGeneratorThanY;
let newGenerators;
let isSpliceFast_;

// TODO: comment out calls to this once sure
function assert(x) {
  if (!x) throw new Error("assertion failed");
}
