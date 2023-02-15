import type { FlatNode } from './types'
import Tree from './tree'

type SwitchProps = {
  checked: boolean
  onChange: (checked: boolean) => void
}

const Switch = (props: SwitchProps) => {
  const { checked, onChange } = props
  const handleChange = (event) => {
    onChange(event.target.checked)
  }
  return <input type="checkbox" checked={checked} onChange={handleChange}  />
}


type TreeProps = {
  nodes: FlatNode[]
}

const FlatNodeTree = (props: TreeProps) => {
  const { nodes } = props

  return (
    <ul>
      <Tree nodes={nodes}>
        {({ node, level, visible, onSwitch }) => (
          <li
            key={`${level}-${node.label}`}
            style={{ paddingLeft: (level + 1) * 20 }}
            className="list-item"
          >
            {node.label}
            <Switch
              checked={visible}
              onChange={onSwitch}
            />
          </li>
        )}
      </Tree>
    </ul>
  )
}

export default FlatNodeTree
