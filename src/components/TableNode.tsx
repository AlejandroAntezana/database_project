import React, { useState } from 'react'
import { Handle, Position, useStore as useFlowStore } from '@xyflow/react'
import type { Table, Column, DataType } from '../store/useStore'
import { Card, CardHeader, CardTitle, CardContent } from './ui/card'
import { Key, Plus, Trash2, Pencil } from 'lucide-react'
import { useStore } from '../store/useStore'

export function TableNode({ data, selected }: { data: Table, selected?: boolean }) {
  const addColumn = useStore((state) => state.addColumn)
  const deleteColumn = useStore((state) => state.deleteColumn)
  const deleteTable = useStore((state) => state.deleteTable)
  const renameTable = useStore((state) => state.renameTable)

  const selectedEdge = useFlowStore((state) => state.edges.find((e) => e.selected))
  const [showAdd, setShowAdd] = useState(false)
  const [colName, setColName] = useState("")
  const [colType, setColType] = useState<DataType>("Varchar")
  const [isPK, setIsPK] = useState(false)

  const [isEditingName, setIsEditingName] = useState(false)
  const [editNameValue, setEditNameValue] = useState(data.name)

  const handleRename = (e: React.FormEvent | React.FocusEvent) => {
    e.preventDefault()
    if (!editNameValue.trim()) {
       setIsEditingName(false)
       setEditNameValue(data.name)
       return
    }
    renameTable(data.id, editNameValue)
    setIsEditingName(false)
  }

  const handleDeleteTable = () => {
    if (window.confirm('¿Seguro que deseas eliminar esta tabla? Se perderán sus datos y relaciones.')) {
      deleteTable(data.id)
    }
  }

  const handleAddColumn = (e: React.FormEvent) => {
    e.preventDefault()
    if (!colName.trim()) return
    addColumn(data.id, { name: colName, type: colType, isPrimaryKey: isPK })
    setColName("")
    setShowAdd(false)
    setIsPK(false)
  }

  return (
    <Card className={`group w-64 shadow-xl bg-card transition-colors ${selected ? 'border-primary ring-2 ring-primary/20' : 'border-border'}`}>
      <Handle type="target" position={Position.Top} className="w-3 h-3 bg-primary" />
      <CardHeader className="bg-muted/50 p-3 rounded-t-xl border-b border-border/50">
        <CardTitle className="text-sm font-bold flex items-center justify-between">
          {isEditingName ? (
            <form onSubmit={handleRename} className="flex items-center gap-2 w-full">
               <input 
                 autoFocus
                 className="text-sm bg-background border rounded px-2 py-1 w-full font-bold h-7"
                 value={editNameValue}
                 onChange={e => setEditNameValue(e.target.value)}
                 onBlur={handleRename}
               />
            </form>
          ) : (
            <>
              <span>{data.name}</span>
              <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => setIsEditingName(true)} className="p-1 rounded text-muted-foreground hover:bg-muted hover:text-foreground transition-colors" title="Renombrar tabla">
                  <Pencil size={14} />
                </button>
                <button onClick={handleDeleteTable} className="p-1 rounded text-destructive/70 hover:bg-destructive/10 hover:text-destructive transition-colors" title="Eliminar tabla">
                  <Trash2 size={14} />
                </button>
              </div>
            </>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0 flex flex-col">
        {(data.columns || []).map((col) => {
          const isHighlighted = selectedEdge && (
            (selectedEdge.source === data.id && selectedEdge.data?.sourceColumn === col.name) ||
            (selectedEdge.target === data.id && selectedEdge.data?.targetColumn === col.name)
          )
          
          return (
            <div key={col.id} className={`flex items-center justify-between px-3 py-2 border-b border-border/40 text-xs hover:bg-muted/30 group transition-colors ${
              isHighlighted ? 'bg-yellow-100 dark:bg-yellow-900/40 outline outline-2 outline-yellow-400 z-10 font-bold' : ''
            }`}>
              <div className="flex items-center gap-2">
                {col.isPrimaryKey ? <Key size={12} className="text-primary" /> : <div className="w-3" />}
                <span className={`font-medium ${isHighlighted ? 'text-yellow-600 dark:text-yellow-400' : 'text-foreground'}`}>{col.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">{col.type}</span>
                <button onClick={() => deleteColumn(data.id, col.id)} className="opacity-0 group-hover:opacity-100 text-destructive transition-opacity">
                  <Trash2 size={12} />
                </button>
              </div>
            </div>
          )
        })}
        
        {showAdd ? (
          <form onSubmit={handleAddColumn} className="p-3 bg-muted/20 flex flex-col gap-2">
            <input 
              autoFocus
              className="text-xs w-full bg-background border border-input rounded p-1" 
              placeholder="Column name" 
              value={colName}
              onChange={e => setColName(e.target.value)}
            />
            <div className="flex items-center gap-2">
              <select 
                className="text-xs bg-background border border-input rounded p-1 flex-1"
                value={colType}
                onChange={e => setColType(e.target.value as DataType)}
              >
                <option value="Integer">Integer</option>
                <option value="Varchar">Varchar</option>
                <option value="Boolean">Boolean</option>
                <option value="Date">Date</option>
              </select>
              <label className="text-[10px] flex items-center gap-1 cursor-pointer">
                <input type="checkbox" checked={isPK} onChange={e => setIsPK(e.target.checked)} />
                PK
              </label>
            </div>
            <div className="flex justify-between gap-2 mt-1">
              <button type="button" onClick={() => setShowAdd(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
              <button type="submit" className="text-xs font-semibold text-primary">Save</button>
            </div>
          </form>
        ) : (
          <button 
            onClick={() => setShowAdd(true)}
            className="flex items-center gap-1 justify-center w-full py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-muted/20 transition-colors"
          >
            <Plus size={12} /> Add column
          </button>
        )}
      </CardContent>
      <Handle type="source" position={Position.Bottom} className="w-3 h-3 bg-primary" />
    </Card>
  )
}
