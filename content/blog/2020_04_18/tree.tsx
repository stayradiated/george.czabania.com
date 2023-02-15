import { useState, useCallback } from 'react'
import { FlatNode, TreeNode } from './types'
import { buildTree } from './tree-utils'

type OnSwitchFn = (
  node: TreeNode,
  event: React.MouseEvent,
  checked: boolean
) => void

interface RecurseListItemsProps {
  visibleNodeIds: Set<string>
  nodes: TreeNode[]
  level?: number
  onSwitch?: OnSwitchFn
  render: (props: { node: TreeNode; level: number }) => React.Element
}

const recurseListItems = (props: RecurseListItemsProps) => {
  const { visibleNodeIds, nodes, level = 0, render, onSwitch } = props

  const items = []
  for (const node of nodes) {
    items.push(
      render({
        node,
        level,
        visible: visibleNodeIds.has(node.id),
        onSwitch: onSwitch.bind(null, node),
      })
    )
    items.push(
      ...recurseListItems({
        ...props,
        nodes: node.children,
        level: level + 1,
      })
    )
  }
  return items
}

interface TreeViewProps {
  nodes: FlatNode[]
  children: (options: {
    node: TreeNode
    level: number
    visible: boolean
    onSwitch: OnSwitchFn
  }) => React.Element
}

const Tree = (props: TreeViewProps) => {
  const { nodes: flatNodes, children } = props

  const treeNodes = buildTree(flatNodes)

  const [visibleNodeIds, setVisibleNodeIds] = useState(new Set<string>())

  const handleSwitch = useCallback(
    (node, event, checked): OnSwitchFn => {
      const set = new Set([...visibleNodeIds])
      if (checked) {
        set.add(node.id)
      } else {
        set.delete(node.id)
      }
      setVisibleNodeIds(set)
    },
    [visibleNodeIds, setVisibleNodeIds]
  )

  return recurseListItems({
    visibleNodeIds,
    nodes: treeNodes,
    render: children,
    onSwitch: handleSwitch,
  })
}

export default Tree
