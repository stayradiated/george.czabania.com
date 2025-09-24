const clean = (input: string): string => {
  const lines = input.split('\n')

  const omitLines: number[] = []

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.match(/@ts-expect-error/)) {
      omitLines.push(i)
    }
  }

  for (let i = omitLines.length - 1; i >= 0; i--) {
    const index = omitLines[i]
    lines.splice(index, 1)
  }

  return lines.join('\n')
}

const load = async (code: Promise<{ default: string }>): Promise<string> => {
  const mod = await code
  return clean(mod.default)
}

const getImportRange = (code: string): string | undefined=> {
  const lines = code.split('\n')

  let lastImportLine: number | undefined
  let isOpenBrace = false

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i]
    if (line.match(/import/)) {
      lastImportLine = i + 1
      if (line.match(/\{/) && !line.match(/\}/)) {
        isOpenBrace = true
      }
    }
    if (isOpenBrace && line.match(/\}/)) {
      isOpenBrace = false
      lastImportLine = i + 1
    }
  }

  if (lastImportLine === undefined) {
    return undefined
  }

  return `1-${lastImportLine}`
}

export { clean, load, getImportRange }
