export function initGenerators(rootGenerator, shouldGeneratorBeRemovedFn, isXABetterGeneratorThanYFn) {
  shouldGeneratorBeRemoved = shouldGeneratorBeRemovedFn
  isXABetterGeneratorThanY = isXABetterGeneratorThanYFn
  generators=[rootGenerator]
}

export function generate() {
  const generator = generators[0]
  const generated = generator.next().value
  if(generated==null) {
    generators.shift()
  }
  return generated
}

export function removeUnwantedGenerators() {
  const newGenerators = []
  for(const generator of generators) {
    if(!shouldGeneratorBeRemoved(generator)) {
      newGenerators.push(generator)
    }
  }
  generators = newGenerators
}

export function addGenerator(generator) {
  const len = generators.length
  if(len==0) {
    generators.push(generator);
    return;
  }
  addGenerator2(generator,0,len-1);
}

function addGenerator2(generator,upperIndexInclusive,lowerIndexInclusive) {
  while(true) {
    //assert(upperIndexInclusive<=lowerIndexInclusive)
    if(isXABetterGeneratorThanY(generator, generators[upperIndexInclusive])) {
      generators.splice(upperIndexInclusive,0,generator)
      return
    }
    if(isXABetterGeneratorThanY(generators[lowerIndexInclusive],generator)) {
      generators.splice(lowerIndexInclusive+1,0,generator)
      return
    }
    if(upperIndexInclusive==lowerIndexInclusive) {
      // as good as each other, put the newest one after:
      generators.splice(lowerIndexInclusive+1,0,generator)
      return
    }
    let midIndexInclusive = Math.ceil((upperIndexInclusive+lowerIndexInclusive)/2)
    //assert(upperIndexInclusive<midIndexInclusive)
    //assert(midIndexInclusive<=lowerIndexInclusive)
    if(isXABetterGeneratorThanY(generator, generators[midIndexInclusive])) {
      lowerIndexInclusive = midIndexInclusive - 1
      //assert(upperIndexInclusive<=lowerIndexInclusive)
      continue
    }
    upperIndexInclusive = midIndexInclusive
    //assert(upperIndexInclusive<=lowerIndexInclusive)
  }
}

export function numOfGenerators() {
  return generators.length
}

let generators = []
let shouldGeneratorBeRemoved
let isXABetterGeneratorThanY

// TODO: comment out calls to this once sure
function assert(x) {
  if (!x) throw new Error("assertion failed");
}
