import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import type { Edge, Node, OnNodesChange, OnEdgesChange } from '@xyflow/react'

export type DataType = 'Integer' | 'Varchar' | 'Boolean' | 'Date'

export interface Column {
  id: string
  name: string
  type: DataType
  isPrimaryKey: boolean
}

export interface Table extends Record<string, unknown> {
  id: string
  name: string
  columns: Column[]
}

export type TableNode = Node<Table, 'table'>

export interface RowData {
  id: string
  tableId: string
  data: Record<string, any>
}

interface DatabaseState {
  nodes: TableNode[]
  edges: Edge[]
  rows: RowData[]
  
  onNodesChange: OnNodesChange<TableNode>
  onEdgesChange: OnEdgesChange
  addTable: (name: string, position: {x: number, y: number}) => void
  addColumn: (tableId: string, column: Omit<Column, 'id'>) => void
  deleteColumn: (tableId: string, columnId: string) => void
  addEdge: (edge: Edge) => void
  updateEdgeJoin: (edgeId: string, sourceCol: string, targetCol: string, cardinality?: string) => void
  insertRow: (tableId: string, data: Record<string, any>) => void
  deleteRow: (rowId: string) => void
}

export const useStore = create<DatabaseState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      rows: [],
      
      onNodesChange: (changes) => {
        set({ nodes: applyNodeChanges(changes, get().nodes) as TableNode[] })
      },
      
      onEdgesChange: (changes) => {
        set({ edges: applyEdgeChanges(changes, get().edges) })
      },
      
      addTable: (name, position) => {
        const id = uuidv4()
        const newNode: TableNode = {
          id, type: 'table', position, data: { id, name, columns: [] }
        }
        set((state) => ({ nodes: [...state.nodes, newNode] }))
      },
      
      addColumn: (tableId, columnPayload) => {
        const colId = uuidv4()
        set((state) => ({
          nodes: state.nodes.map(node => node.id === tableId ? {
            ...node, data: { ...node.data, columns: [...(node.data.columns || []), { id: colId, ...columnPayload }] }
          } : node)
        }))
      },

      deleteColumn: (tableId, columnId) => {
        set((state) => ({
          nodes: state.nodes.map(node => node.id === tableId ? {
            ...node, data: { ...node.data, columns: (node.data.columns || []).filter(c => c.id !== columnId) }
          } : node)
        }))
      },
      
      addEdge: (edge) => set((state) => ({ edges: [...state.edges, { ...edge, data: {} }] })),

      updateEdgeJoin: (edgeId, sourceCol, targetCol, cardinality) => {
        set((state) => ({
          edges: state.edges.map(e => e.id === edgeId ? { 
            ...e, 
            data: { 
              ...e.data, 
              sourceColumn: sourceCol, 
              targetColumn: targetCol,
              cardinality: cardinality !== undefined ? cardinality : (e.data?.cardinality || '1:1')
            } 
          } : e)
        }))
      },
      
      insertRow: (tableId, recordData) => {
        const id = uuidv4()
        set((state) => ({ rows: [...state.rows, { id, tableId, data: recordData }] }))
      },
      
      deleteRow: (rowId) => set((state) => ({ rows: state.rows.filter(r => r.id !== rowId) }))
    }),
    {
      name: 'edudb-storage',
    }
  )
)
