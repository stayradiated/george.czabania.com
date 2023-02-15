import type { FlatNode } from './types'
import emoji from './emoji'

const COUNT = 3

const uniquePick = <T,>(count: number, array: T[]): T[] => {
  if (count < 0) {
    throw new Error('`count` must be >= 0')
  }
  if (count > array.length) {
    throw new Error('`count` must be <= `array.length')
  }

  const picked = [] as T[]
  const unpicked = [...array]

  for (let i = 0; i < count; i++) {
    const index = Math.floor(Math.random() * unpicked.length)
    picked.push(unpicked[index])
    unpicked.splice(index, 1)
  }
  return picked
}

const randomFlatNodes = (): FlatNode[] => {
  const i = 0

  const nodes = [] as FlatNode[]

  nodes.push({
    id: '__root__',
    parent: null,
    label: 'Food',
  })

  for (const [groupLabel, group] of emoji) {
    const emojis = uniquePick(COUNT, group)

    nodes.push({
      id: groupLabel,
      parent: '__root__',
      label: groupLabel,
    })

    for (const [emoji, name] of emojis) {
      nodes.push({
        id: emoji,
        parent: groupLabel,
        label: `${emoji} ${name}`,
      })
    }
  }

  return nodes
}

const buildTree = (nodes: FlatNode[], rootNodes?: FlatNode[]): TreeNode[] => {
  if (rootNodes == null) {
    rootNodes = nodes.filter((node) => node.parent == null)
  }

  return rootNodes
    .map((node) => {
      const childNodes = nodes.filter((childNode) => {
        return childNode.parent === node.id
      })

      return {
        id: node.id,
        label: node.label,
        children: buildTree(nodes, childNodes),
      }
    })
    .filter(Boolean)
}

export { randomFlatNodes, buildTree }
