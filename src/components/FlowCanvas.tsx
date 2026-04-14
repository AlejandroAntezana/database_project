import { useMemo, useCallback } from 'react'
import { ReactFlow, Background, Controls } from '@xyflow/react'
import type { Connection } from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useStore } from '../store/useStore'
import { TableNode } from './TableNode'

export function FlowCanvas() {
  const nodes = useStore((state) => state.nodes)
  const edges = useStore((state) => state.edges)
  const onNodesChange = useStore((state) => state.onNodesChange)
  const onEdgesChange = useStore((state) => state.onEdgesChange)
  const addEdge = useStore((state) => state.addEdge)

  const nodeTypes = useMemo(() => ({ table: TableNode }), [])

  const onConnect = useCallback(
    (params: Connection) => {
      addEdge({ ...params, id: `${params.source}-${params.target}` })
    },
    [addEdge]
  )

  return (
    <div className="w-full h-full">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        fitView
      >
        <Background color="#ccc" gap={16} />
        <Controls />
      </ReactFlow>
    </div>
  )
}
