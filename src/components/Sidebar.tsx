import React, { useState } from 'react'
import { Plus, Database } from 'lucide-react'
import { useStore } from '../store/useStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { getViveroExample, getUrbanoExample } from '../lib/examples'

export function Sidebar({ className }: { className?: string }) {
  const addTable = useStore((state) => state.addTable)
  const loadSchema = useStore((state) => state.loadSchema)
  const nodes = useStore((state) => state.nodes)
  const [newTableName, setNewTableName] = useState("")

  const handleAddTable = (e: React.FormEvent) => {
    e.preventDefault()
    if (!newTableName.trim()) return
    addTable(newTableName, { x: Math.random() * 200 + 50, y: Math.random() * 200 + 50 })
    setNewTableName("")
  }

  const handleLoadVivero = () => {
    const { nodes, edges, rows } = getViveroExample()
    loadSchema(nodes, edges, rows)
  }

  const handleLoadUrbano = () => {
    const { nodes, edges, rows } = getUrbanoExample()
    loadSchema(nodes, edges, rows)
  }

  return (
    <aside className={`border-r bg-card h-full flex flex-col relative z-20 shadow-soft ${className || "w-72"}`}>
      <div className="p-6 border-b border-border/50">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Schema Tools</h2>
        <form onSubmit={handleAddTable} className="flex flex-col gap-3">
          <Input 
            placeholder="Table name..." 
            value={newTableName} 
            onChange={(e) => setNewTableName(e.target.value)}
          />
          <Button type="submit" className="w-full gap-2">
            <Plus size={16} /> Add Table
          </Button>
        </form>
        <div className="mt-4 flex flex-col gap-2">
          <h3 className="font-semibold text-xs tracking-wider text-muted-foreground mt-2 mb-1">Cargar Ejemplo</h3>
          <Button type="button" variant="secondary" size="sm" onClick={handleLoadVivero} className="w-full text-xs justify-start px-3 bg-muted/50 hover:bg-muted font-bold text-emerald-600 dark:text-emerald-400">🌱 Vivero</Button>
          <Button type="button" variant="secondary" size="sm" onClick={handleLoadUrbano} className="w-full text-xs justify-start px-3 bg-muted/50 hover:bg-muted font-bold text-blue-600 dark:text-blue-400">🏙️ Mantenimiento Urbano</Button>
        </div>
      </div>
      
      <div className="flex-1 overflow-auto p-6">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Tables Info</h2>
        <div className="flex flex-col gap-3">
          {nodes.length === 0 ? (
            <div className="text-sm text-muted-foreground flex items-center justify-center p-4 border border-dashed rounded-lg">
              Create a table to start
            </div>
          ) : (
            nodes.map((node) => {
              const tableData = node.data as any
              return (
                <div key={node.id} className="border rounded-md p-3 bg-background hover:border-primary/50 transition-colors">
                  <div className="flex items-center gap-2 mb-2 font-semibold text-sm text-foreground">
                    <Database size={14} className="text-primary" />
                    {tableData.name}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {tableData.columns?.length || 0} columns
                  </div>
                </div>
              )
            })
          )}
        </div>
      </div>
    </aside>
  )
}
