export interface TreeNode {
  id: number
  label: string
  children: Node[]
}

export interface FlatNode {
  id: number
  parent: number
  label: string
}
