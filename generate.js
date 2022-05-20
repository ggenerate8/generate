let generators = []
export function initGenerators(rootGenerator,testFn) {
  generators.length = 0
  generators.push(rootGenerator)
  generate()
  testFn()
}

export let generated

export function generate() {
  const generator = generators[0]
  generated = generator.next().value
  if(generated==null) {
    generators.shift()
  }
}

let shouldGeneratorBeRemoved
export function setShouldGeneratorBeRemovedFn(shouldGeneratorBeRemovedFn) {
  shouldGeneratorBeRemoved = shouldGeneratorBeRemovedFn
}

export function removeGenerators(shouldGeneratorBeRemovedFn) {
  const newGenerators = []
  for(const generator of generators) {
    if(!shouldGeneratorBeRemovedFn(generator)) {
      newGenerators.add(generator)
    }
  }
  let generators = newGenerators
}


let isXABetterGeneratorThanY
export function setIsXABetterGeneratorThanYFn(isXABetterGeneratorThanYFn) {
  isXABetterGeneratorThanY = isXABetterGeneratorThanYFn
}

export function addGenerator(generator) {
  const numOfGeneratorsVar = generators.length
  for(let i=0;i<numOfGeneratorsVar,i++) {
    if(isXABetterGeneratorThanY(generator, generators[i])) {
      generators.splice(i,0,generator)
      return
    }
  }
  generators.push(generator)
}

export function numOfGenerators() {
  return generators.length
}
