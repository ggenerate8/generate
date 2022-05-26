export function initGenerators(rootGenerator, testFn, shouldGeneratorBeRemovedFn, isXABetterGeneratorThanYFn) {
  shouldGeneratorBeRemoved = shouldGeneratorBeRemovedFn
  isXABetterGeneratorThanY = isXABetterGeneratorThanYFn
  generators=[rootGenerator]
  const generated = generate()
  testFn(generated)
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
  let generators = newGenerators
}

export function addGenerator(generator) {
  const len = generators.length
  for(let i=0;i<len;i++) {
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

let generators = []
let shouldGeneratorBeRemoved
let isXABetterGeneratorThanY
