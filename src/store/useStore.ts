import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { v4 as uuidv4 } from 'uuid'
import { applyNodeChanges, applyEdgeChanges } from '@xyflow/react'
import type { Edge, Node, OnNodesChange, OnEdgesChange } from '@xyflow/react'

export type DataType = 'Integer' | 'Varchar' | 'Boolean' | 'Date' | 'Decimal'

export interface Column {
  id: string
  name: string
  type: DataType
  isPrimaryKey: boolean
  isRequired?: boolean
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

export interface QueryCondition {
  id: string
  column: string
  operator: string
  value: string | number | boolean
}

export interface QuerySort {
  column: string
  direction: 'ASC' | 'DESC'
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
  deleteTable: (id: string) => void
  renameTable: (id: string, newName: string) => void
  deleteEdge: (id: string) => void
  updateColumn: (tableId: string, columnId: string, payload: Partial<Column>) => void
  loadSchema: (nodes: TableNode[], edges: Edge[], rows: RowData[]) => void
  
  selectedQueryTable: string | null
  queryConditions: QueryCondition[]
  logicalOperator: 'AND' | 'OR'
  querySorts: QuerySort[]
  
  setQueryTable: (tableId: string | null) => void
  addQueryCondition: (condition: Omit<QueryCondition, 'id'>) => void
  updateQueryCondition: (id: string, payload: Partial<Omit<QueryCondition, 'id'>>) => void
  removeQueryCondition: (id: string) => void
  setLogicalOperator: (operator: 'AND' | 'OR') => void
  addQuerySort: (sort: QuerySort) => void
  updateQuerySort: (index: number, sort: QuerySort) => void
  removeQuerySort: (index: number) => void
}

export const useStore = create<DatabaseState>()(
  persist(
    (set, get) => ({
      nodes: [],
      edges: [],
      rows: [],
      selectedQueryTable: null,
      queryConditions: [],
      logicalOperator: 'AND',
      querySorts: [],
      
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
      
      updateColumn: (tableId, columnId, payload) => {
        set((state) => ({
          nodes: state.nodes.map(node => node.id === tableId ? {
            ...node, data: { ...node.data, columns: (node.data.columns || []).map(c => c.id === columnId ? { ...c, ...payload } : c) }
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
      
      deleteRow: (rowId) => set((state) => ({ rows: state.rows.filter(r => r.id !== rowId) })),

      deleteTable: (id) => set((state) => ({
        nodes: state.nodes.filter(n => n.id !== id),
        edges: state.edges.filter(e => e.source !== id && e.target !== id),
        rows: state.rows.filter(r => r.tableId !== id)
      })),

      renameTable: (id, newName) => set((state) => ({
        nodes: state.nodes.map(node => node.id === id ? { 
          ...node, 
          data: { ...node.data, name: newName } 
        } : node)
      })),

      deleteEdge: (id) => set((state) => ({
        edges: state.edges.filter(e => e.id !== id)
      })),

      loadSchema: (nodes, edges, rows) => set({ nodes, edges, rows }),

      setQueryTable: (tableId) => set({ selectedQueryTable: tableId, queryConditions: [], querySorts: [] }),
      addQueryCondition: (condition) => set((state) => ({ queryConditions: [...state.queryConditions, { id: uuidv4(), ...condition }] })),
      updateQueryCondition: (id, payload) => set((state) => ({ queryConditions: state.queryConditions.map(c => c.id === id ? { ...c, ...payload } : c) })),
      removeQueryCondition: (id) => set((state) => ({ queryConditions: state.queryConditions.filter(c => c.id !== id) })),
      setLogicalOperator: (operator) => set({ logicalOperator: operator }),
      addQuerySort: (sort) => set((state) => ({ querySorts: [...state.querySorts, sort] })),
      updateQuerySort: (index, sort) => set((state) => {
        const newSorts = [...state.querySorts]
        newSorts[index] = sort
        return { querySorts: newSorts }
      }),
      removeQuerySort: (index) => set((state) => {
        const newSorts = [...state.querySorts]
        newSorts.splice(index, 1)
        return { querySorts: newSorts }
      })
    }),
    {
      name: 'edudb-storage',
    }
  )
)
