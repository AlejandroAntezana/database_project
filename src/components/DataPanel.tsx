import React, { useState, useMemo } from 'react'
import { useStore } from '../store/useStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Trash2, Link as LinkIcon, Database, TerminalSquare, CheckSquare } from 'lucide-react'

export function DataPanel() {
  const nodes = useStore(state => state.nodes)
  const edges = useStore(state => state.edges)
  const rows = useStore(state => state.rows)
  const insertRow = useStore(state => state.insertRow)
  const deleteRow = useStore(state => state.deleteRow)
  const updateEdgeJoin = useStore(state => state.updateEdgeJoin)

  const selectedNode = nodes.find(n => n.selected)
  const selectedEdge = edges.find(e => e.selected)
  
  const table = selectedNode?.data as any 

  const [formData, setFormData] = useState<Record<string, any>>({})
  const [filterQuery, setFilterQuery] = useState("")

  // Query Sandbox States
  const [activeTab, setActiveTab] = useState<'data' | 'query'>('data')
  const [queryCols, setQueryCols] = useState<Record<string, boolean>>({})
  const [whereClause, setWhereClause] = useState("")

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

  // Dynamic Query Execution Filter
  const queryRows = useMemo(() => {
    if (!table || activeTab !== 'query') return []
    let data = rows.filter(r => r.tableId === table.id)
    if (whereClause.trim()) {
       try {
         const keys = table.columns?.map((c: any) => c.name) || []
         if (keys.length > 0) {
           // Basic JS eval wrapper for conditions like "precio > 100"
           let condition = whereClause.replace(/(?<![=<>!])=(?![=])/g, '===') // Replace single '=' with '===' safely
           const func = new Function(...keys, `return ${condition};`)
           data = data.filter(r => {
             try { return func(...keys.map((k: string) => r.data[k])) } catch { return false }
           })
         }
       } catch (e) {
         return [] // Invalid syntax
       }
    }
    return data
  }, [rows, table, whereClause, activeTab])


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
      <div className="h-80 border-t bg-card shrink-0 flex flex-col shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20 relative">
        <div className="flex flex-col p-4 border-b border-border/50 bg-muted/10 gap-2">
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
      <div className="h-72 border-t bg-card shrink-0 flex flex-col p-4 shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20 relative">
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
  const selectedKeys = Object.keys(queryCols).filter(k => queryCols[k])

  return (
    <div className="h-80 border-t bg-card shrink-0 flex flex-col shadow-[0_-4px_20px_-10px_rgba(0,0,0,0.1)] z-20 relative transition-all">
      <div className="flex items-center justify-between px-4 py-2 border-b border-border/50 bg-muted/10">
        <div className="flex items-center gap-6">
          <h2 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground flex items-center">
            <Database size={16} className="mr-2" />
            <span className="text-primary font-bold">{table.name}</span>
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
        <div className="w-80 border-r border-border/50 p-4 overflow-y-auto bg-muted/10 shrink-0">
          
          {activeTab === 'data' ? (
            <>
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
                         required={col.isPrimaryKey}
                         type={col.type === 'Integer' ? 'number' : col.type === 'Date' ? 'date' : 'text'}
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
            </>
          ) : (
            <>
              <h3 className="font-semibold text-xs text-indigo-700 uppercase tracking-wider mb-4 flex items-center gap-2">
                 <CheckSquare size={14} /> Constructor SQL
              </h3>
              <div className="flex flex-col gap-4">
                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">1. SELECT (Columnas)</label>
                  <div className="flex flex-col gap-2 p-3 bg-background rounded border">
                    {tableCols.map((col: any) => (
                      <label key={col.id} className="flex items-center gap-2 text-xs cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={!!queryCols[col.name]}
                          onChange={(e) => setQueryCols({ ...queryCols, [col.name]: e.target.checked })}
                          className="rounded text-indigo-600 focus:ring-indigo-500"
                        />
                        <span>{col.name} <span className="text-[10px] text-muted-foreground">({col.type})</span></span>
                      </label>
                    ))}
                    {tableCols.length === 0 && <span className="text-xs text-muted-foreground">Sin columnas.</span>}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-bold text-muted-foreground mb-2 block">2. WHERE (Filtro Visual)</label>
                  <Input 
                    placeholder="Ej: id > 5 OR nombre === 'Juan'"
                    value={whereClause}
                    onChange={(e) => setWhereClause(e.target.value)}
                    className="h-8 text-xs font-mono bg-background border-indigo-200 focus-visible:ring-indigo-500"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1 px-1">Se interpreta en vivo sobre los datos.</p>
                </div>
              </div>
            </>
          )}

        </div>

        {/* RIGHT COLUMN: Table Output */}
        <div className="flex-1 flex flex-col overflow-hidden bg-background relative">
          
          {/* Query Preview Banner */}
          {activeTab === 'query' && (
            <div className="bg-indigo-950 text-indigo-200 p-3 font-mono text-xs border-b border-indigo-900 shrink-0">
               <span className="text-pink-400">SELECT</span> {selectedKeys.length > 0 ? selectedKeys.join(', ') : '*'} <br />
               <span className="text-pink-400">FROM</span> <span className="text-emerald-300">{table.name}</span>
               {whereClause.trim() && <><br /><span className="text-pink-400">WHERE</span> {whereClause}</>}
               <span className="text-indigo-400">;</span>
            </div>
          )}

          <div className="flex-1 overflow-auto p-0">
            {tableCols.length === 0 ? (
               <div className="text-sm text-muted-foreground flex items-center justify-center h-full">
                 Estructura vacía
               </div>
            ) : (
              <table className="w-full text-sm text-left">
                <thead className="text-xs text-muted-foreground uppercase bg-muted/30 sticky top-0 shadow-sm">
                  <tr>
                    {tableCols
                      .filter((col: any) => activeTab === 'data' || selectedKeys.length === 0 || queryCols[col.name])
                      .map((col: any) => (
                        <th key={col.id} className="px-4 py-3 font-semibold">{col.name}</th>
                    ))}
                    {activeTab === 'data' && <th className="px-4 py-3 w-10"></th>}
                  </tr>
                </thead>
                <tbody>
                  {(activeTab === 'data' ? tableRows : queryRows).map((row) => (
                    <tr key={row.id} className="border-b border-border/50 hover:bg-muted/20 transition-colors">
                      {tableCols
                        .filter((col: any) => activeTab === 'data' || selectedKeys.length === 0 || queryCols[col.name])
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
