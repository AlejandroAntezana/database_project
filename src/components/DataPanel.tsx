import React, { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Trash2, Link as LinkIcon, Database, TerminalSquare } from 'lucide-react'
import { QueryBuilder } from './QueryBuilder'

export function DataPanel() {
  const nodes = useStore(state => state.nodes)
  const edges = useStore(state => state.edges)
  const rows = useStore(state => state.rows)
  const insertRow = useStore(state => state.insertRow)
  const deleteRow = useStore(state => state.deleteRow)
  const updateEdgeJoin = useStore(state => state.updateEdgeJoin)
  const deleteEdge = useStore(state => state.deleteEdge)

  const selectedNode = nodes.find(n => n.selected)
  const selectedEdge = edges.find(e => e.selected)
  
  const table = selectedNode?.data as any 

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [filterQuery, setFilterQuery] = useState("")

  // Query Sandbox States
  const [activeTab, setActiveTab] = useState<'data' | 'query'>('data')
  
  // Visual Query Builder States
  const selectedQueryTable = useStore(state => state.selectedQueryTable)
  const queryConditions = useStore(state => state.queryConditions)
  const logicalOperator = useStore(state => state.logicalOperator)
  const querySorts = useStore(state => state.querySorts)

  const queryTableData = nodes.find(n => n.id === selectedQueryTable)?.data as any

  const tableRows = useMemo(() => {
    if (!table) return []
    let data = rows.filter(r => r.tableId === table.id)
    if (filterQuery.trim()) {
       try {
         const query = filterQuery.toLowerCase()
         data = data.filter(r => Object.values(r.data || {}).some(v => String(v).toLowerCase().includes(query)))
       } catch (e) {
         // ignore
       }
    }
    return data
  }, [rows, table, filterQuery])

  // Compute selected edge data unconditionally for hooks
  const sourceTable = selectedEdge ? nodes.find(n => n.id === selectedEdge.source)?.data as any : undefined
  const targetTable = selectedEdge ? nodes.find(n => n.id === selectedEdge.target)?.data as any : undefined
  const edgeData = selectedEdge?.data || {}

  // Simulated INNER JOIN computed unconditionally
  const joinedRows = useMemo(() => {
    if (!selectedEdge) return []
    if (!edgeData.sourceColumn || !edgeData.targetColumn) return []
    if (!sourceTable || !targetTable) return []
    
    const srcRows = rows.filter(r => r.tableId === sourceTable.id)
    const tgtRows = rows.filter(r => r.tableId === targetTable.id)
    
    const results: any[] = []
    srcRows.forEach(sr => {
      const srcVal = String(sr.data?.[edgeData.sourceColumn as string]).toLowerCase()
      tgtRows.forEach(tr => {
        const tgtVal = String(tr.data?.[edgeData.targetColumn as string]).toLowerCase()
        if (srcVal === tgtVal) {
           results.push({ ...sr.data, ...tr.data }) // simplistic merge
        }
      })
    })
    return results
  }, [rows, sourceTable, targetTable, edgeData, selectedEdge])

  // Dynamic Query Execution Filter (Visual Builder)
  const queryRows = useMemo(() => {
    if (!selectedQueryTable || activeTab !== 'query') return []
    let data = rows.filter(r => r.tableId === selectedQueryTable)
    
    if (queryConditions.length > 0) {
      data = data.filter(r => {
        const results = queryConditions.map(c => {
          if (!c.column || !c.operator) return true // ignore incomplete
          const rowVal = r.data[c.column]
          
          if (c.operator === 'IS_TRUE') return rowVal === true || String(rowVal).toLowerCase() === 'true'
          if (c.operator === 'IS_FALSE') return rowVal === false || String(rowVal).toLowerCase() === 'false'
          if (c.operator === 'CONTAINS') return String(rowVal).toLowerCase().includes(String(c.value).toLowerCase())
          
          if (c.operator === '=') return String(rowVal) === String(c.value)
          
          const nRow = Number(rowVal)
          const nVal = Number(c.value)
          if (!isNaN(nRow) && !isNaN(nVal)) {
             if (c.operator === '>') return nRow > nVal
             if (c.operator === '<') return nRow < nVal
          }
          return false
        })
        
        return logicalOperator === 'AND' ? results.every(res => res) : results.some(res => res)
      })
    }

    if (querySorts.length > 0) {
      data = [...data].sort((a, b) => {
        for (const sort of querySorts) {
           if (!sort.column) continue
           const valA = a.data[sort.column]
           const valB = b.data[sort.column]
           if (valA === valB) continue
           
           const numA = Number(valA)
           const numB = Number(valB)
           const isNum = !isNaN(numA) && !isNaN(numB)
           
           let compare = 0
           if (isNum) compare = numA - numB
           else compare = String(valA).localeCompare(String(valB))
           
           return sort.direction === 'ASC' ? compare : -compare
        }
        return 0
      })
    }
    
    return data
  }, [rows, selectedQueryTable, queryConditions, logicalOperator, querySorts, activeTab])


  // Semantic Relationship Translator
  const translateRelation = (src: string, tgt: string, card: string) => {
    switch (card) {
      case '1:1': return `Un ${src} tiene exactamente un ${tgt}, y un ${tgt} pertenece a un solo ${src}.`
      case '1:N': return `Un ${src} puede tener muchos ${tgt}s, pero un ${tgt} pertenece a un solo ${src}.`
      case 'N:M': return `Un ${src} puede tener muchos ${tgt}s, y un ${tgt} puede tener muchos ${src}s.`
      default: return `Relación entre ${src} y ${tgt}.`
    }
  }

  // --- JOIN LOGIC FOR EDGES ---
  if (selectedEdge) {
    // Generate combined columns for UI
    const sourceCols = sourceTable?.columns || []
    const targetCols = targetTable?.columns || []
    const combinedCols = [...sourceCols, ...targetCols].filter((v,i,a)=>a.findIndex((t: any)=>(t.name===v.name))===i)
    const currentCard = (edgeData.cardinality as string) || '1:1'

    return (
      <div className="h-full border-t bg-card shrink-0 flex flex-col shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20 relative">
        <div className="flex flex-col p-4 border-b border-border/50 bg-muted/10 gap-2">
          <div className="flex items-center justify-between w-full">
            <div className="flex items-center space-x-6">
              <div className="flex items-center text-primary">
                <LinkIcon className="mr-2" size={18} />
                <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                  Join Configuration
                </h2>
              </div>
              {sourceTable && targetTable ? (
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-primary">{sourceTable.name}</span>
                    <select className="bg-background border rounded px-2 py-1" value={(edgeData.sourceColumn as string) || ''} onChange={e => updateEdgeJoin(selectedEdge.id, e.target.value, (edgeData.targetColumn as string) || '', currentCard)}>
                      <option value="">-- Columna --</option>
                      {sourceCols.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                  </div>
                  <span className="font-bold text-muted-foreground">=</span>
                  <div className="flex items-center gap-2">
                    <select className="bg-background border rounded px-2 py-1" value={(edgeData.targetColumn as string) || ''} onChange={e => updateEdgeJoin(selectedEdge.id, (edgeData.sourceColumn as string) || '', e.target.value, currentCard)}>
                      <option value="">-- Columna --</option>
                      {targetCols.map((c: any) => <option key={c.id} value={c.name}>{c.name}</option>)}
                    </select>
                    <span className="font-semibold text-primary">{targetTable.name}</span>
                  </div>
                  <div className="flex items-center gap-2 ml-4 pl-4 border-l">
                    <span className="font-medium text-muted-foreground">Cardinalidad:</span>
                    <select className="bg-background border rounded px-2 py-1 font-bold" value={currentCard} onChange={e => updateEdgeJoin(selectedEdge.id, (edgeData.sourceColumn as string) || '', (edgeData.targetColumn as string) || '', e.target.value)}>
                      <option value="1:1">1 a 1 (1:1)</option>
                      <option value="1:N">1 a Muchos (1:N)</option>
                      <option value="N:M">Muchos a Muchos (N:M)</option>
                    </select>
                  </div>
                </div>
              ) : <span className="text-destructive text-xs">Tablas origen/destino no encontradas.</span>}
            </div>
            <button onClick={() => deleteEdge(selectedEdge.id)} className="flex items-center text-xs font-semibold px-3 py-1.5 bg-destructive text-destructive-foreground hover:bg-destructive/90 rounded-md transition-colors" title="Eliminar Relación">
              <Trash2 size={14} className="mr-1" /> Eliminar
            </button>
          </div>
          {sourceTable && targetTable && (
            <div className="text-xs text-muted-foreground bg-primary/10 text-primary px-3 py-1.5 rounded-md inline-block w-fit font-medium">
              📖 <b>Semántica:</b> {translateRelation(sourceTable.name, targetTable.name, currentCard)}
            </div>
          )}
        </div>
        
        <div className="flex-1 overflow-auto bg-background p-4 relative">
          <h3 className="absolute top-2 left-4 text-xs font-bold text-muted-foreground opacity-50 uppercase tracking-widest">Live Join Preview</h3>
          {!edgeData.sourceColumn || !edgeData.targetColumn ? (
            <div className="text-sm text-muted-foreground flex justify-center items-center h-full">
               Selecciona las propiedades del join para ver la tabla combinada.
            </div>
          ) : (
            <div className="mt-4">
               <table className="w-full text-sm text-left border">
                 <thead className="bg-muted/30 text-xs uppercase">
                   <tr>
                     {combinedCols.map((c: any, i: number) => (
                       <th key={c.id || i} className="px-4 py-2 border-r last:border-0">{c.name}</th>
                     ))}
                   </tr>
                 </thead>
                 <tbody>
                   {joinedRows.slice(0, 5).map((row, i) => (
                     <tr key={i} className="border-t hover:bg-muted/10">
                       {combinedCols.map((col: any, j: number) => (
                         <td key={col.id || j} className="px-4 py-2 border-r last:border-0">{row[col.name]?.toString() || '-'}</td>
                       ))}
                     </tr>
                   ))}
                   {joinedRows.length === 0 && (
                     <tr>
                       <td colSpan={combinedCols.length} className="text-center py-6 text-muted-foreground">
                         Los datos no coinciden. Inserta registros con IDs idénticos en ambos lados.
                       </td>
                     </tr>
                   )}
                   {joinedRows.length > 5 && (
                     <tr>
                       <td colSpan={combinedCols.length} className="text-center py-2 text-xs text-muted-foreground bg-muted/5">
                         Visualizando primeros 5 de {joinedRows.length} registros combinados.
                       </td>
                     </tr>
                   )}
                 </tbody>
               </table>
            </div>
          )}
        </div>
      </div>
    )
  }

  // --- STANDARD TABLE LOGIC ---

  if (!table) {
    return (
      <div className="h-full border-t bg-card shrink-0 flex flex-col p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20 relative">
        <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground mb-4">Panel de Control</h2>
        <div className="flex-1 bg-background rounded-md border border-dashed border-border/70 p-4 flex flex-col gap-2 items-center justify-center text-sm text-muted-foreground text-center">
          <Database size={40} className="text-border mb-2" />
          <p>Selecciona una <b>Tabla</b> en el canvas para insertar datos o usar el Query Sandbox.</p>
          <p>Selecciona una <b>Línea de Relación (Edge)</b> para testear Joins.</p>
        </div>
      </div>
    )
  }

  const handleInsert = (e: React.FormEvent) => {
    e.preventDefault()
    insertRow(table.id, formData)
    setFormData({})
  }
  
  const tableCols = table.columns || []
  const displayCols = activeTab === 'data' ? tableCols : (queryTableData?.columns || [])

  return (
    <div className="h-full border-t bg-card shrink-0 flex flex-col shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20 relative transition-all">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/10">
        <div className="flex items-center gap-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center">
            <Database size={16} className="mr-2" />
            <span className="text-primary font-bold">{activeTab === 'data' ? table.name : "Query Sandbox"}</span>
          </h2>
          <div className="flex bg-background border rounded-md overflow-hidden text-xs">
            <button 
              className={`px-3 py-1.5 transition-colors ${activeTab === 'data' ? 'bg-primary text-primary-foreground font-bold' : 'hover:bg-muted'}`}
              onClick={() => setActiveTab('data')}
            >
              Datos (DML)
            </button>
            <button 
              className={`px-3 py-1.5 transition-colors flex items-center gap-1 ${activeTab === 'query' ? 'bg-indigo-600 text-white font-bold' : 'hover:bg-muted'}`}
              onClick={() => setActiveTab('query')}
            >
              <TerminalSquare size={12} />
              Query Sandbox
            </button>
          </div>
        </div>
        
        {activeTab === 'data' && (
          <Input 
            placeholder="Buscar global..." 
            value={filterQuery}
            onChange={e => setFilterQuery(e.target.value)}
            className="w-48 h-7 text-xs bg-background"
          />
        )}
      </div>
      
      <div className="flex flex-1 overflow-hidden">
        {/* LEFT COLUMN: Data Entry OR Query Builder */}
        <div className={`${activeTab === 'query' ? 'w-[500px]' : 'w-80'} border-r border-border/50 shrink-0 transition-all duration-300 flex flex-col overflow-hidden`}>
          {activeTab === 'data' ? (
            <div className="p-4 bg-muted/10 h-full overflow-y-auto">
              <h3 className="font-semibold text-xs text-foreground uppercase tracking-wider mb-4">Insertar Fila</h3>
              <form onSubmit={handleInsert} className="flex flex-col gap-3">
                {tableCols.map((col: any) => (
                   <div key={col.id}>
                     <label className="text-xs text-muted-foreground mb-1 block font-medium">
                       {col.name} <span className="text-[10px] opacity-70">({col.type})</span>
                     </label>
                     {col.type === 'Boolean' ? (
                       <select 
                         className="w-full text-xs h-8 bg-background border border-input rounded p-1"
                         value={formData[col.name] || 'false'}
                         onChange={e => setFormData({ ...formData, [col.name]: e.target.value })}
                       >
                         <option value="false">False</option>
                         <option value="true">True</option>
                       </select>
                     ) : (
                       <Input 
                         required={col.isPrimaryKey || col.isRequired}
                         type={col.type === 'Integer' || col.type === 'Decimal' ? 'number' : col.type === 'Date' ? 'date' : 'text'}
                         step={col.type === 'Decimal' ? 'any' : undefined}
                         value={formData[col.name] || ''}
                         onChange={e => setFormData({ ...formData, [col.name]: e.target.value })}
                         className="h-8 text-xs bg-background"
                       />
                     )}
                   </div>
                ))}
                {tableCols.length > 0 && (
                  <Button type="submit" size="sm" className="mt-4 w-full font-bold">Guardar</Button>
                )}
                {tableCols.length === 0 && (
                  <p className="text-xs text-muted-foreground">Añade columnas primero.</p>
                )}
              </form>
            </div>
          ) : (
            <QueryBuilder />
          )}
        </div>

        {/* RIGHT COLUMN: Table Output */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background relative">

          <div className="flex-1 overflow-auto p-0">
            {displayCols.length === 0 ? (
               <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
                 Estructura vacía o tabla no seleccionada.
               </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0 shadow-sm">
                  <tr>
                    {displayCols
                      .map((col: any) => (
                        <th key={col.id} className="px-4 py-3 font-semibold">{col.name}</th>
                    ))}
                    {activeTab === 'data' && <th className="px-4 py-3 w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'data' ? tableRows : queryRows).map((row) => (
                    <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      {displayCols
                        .map((col: any) => (
                        <td key={col.id} className="px-4 py-2 truncate max-w-[200px] text-foreground font-mono text-xs">
                          {row.data[col.name]?.toString() || '-'}
                        </td>
                      ))}
                      {activeTab === 'data' && (
                        <td className="px-4 py-2 text-right">
                           <button onClick={() => deleteRow(row.id)} className="text-destructive/70 hover:text-destructive transition-colors">
                             <Trash2 size={14} />
                           </button>
                        </td>
                      )}
                    </tr>
                  ))}
                  {(activeTab === 'data' ? tableRows : queryRows).length === 0 && (
                    <tr>
                      <td colSpan={10} className="text-center py-12 text-muted-foreground">
                        No hay registros que mostrar.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
