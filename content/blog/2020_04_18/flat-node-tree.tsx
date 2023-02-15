import { React } from 'react'
import Switch from '@material-ui/core/Switch'
import styled from '@emotion/styled'

import { FlatNode } from './types'
import Tree from './tree'

const ListItem = styled.li`
  display: flex;
  justify-content: space-between;

  list-style-type: none;
  background: #eee;
  line-height: 2;
  margin-bottom: 1px;
`

interface TreeProps {
  nodes: FlatNode[]
}

const FlatNodeTree = (props: TreeProps) => {
  const { nodes } = props

  return (
    <ul>
      <Tree nodes={nodes}>
        {({ node, level, visible, onSwitch }) => (
          <ListItem
            key={`${level}-${node.label}`}
            style={{ paddingLeft: (level + 1) * 20 }}
          >
            {node.label}
            <Switch
              color="primary"
              onChange={onSwitch}
              checked={visible}
            />
          </ListItem>
        )}
      </Tree>
    </ul>
  )
}

export default FlatNodeTree
