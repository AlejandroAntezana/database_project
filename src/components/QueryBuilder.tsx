import { useMemo } from 'react'
import { useStore } from '../store/useStore'
import { Button } from './ui/button'
import { Input } from './ui/input'
import { Trash2, Plus, TerminalSquare, MessageSquareText } from 'lucide-react'
import type { DataType } from '../store/useStore'

export function QueryBuilder() {
  const nodes = useStore(state => state.nodes)
  const selectedQueryTable = useStore(state => state.selectedQueryTable)
  const queryJoins = useStore(state => state.queryJoins)
  const querySelections = useStore(state => state.querySelections)
  const queryConditions = useStore(state => state.queryConditions)
  const logicalOperator = useStore(state => state.logicalOperator)
  const querySorts = useStore(state => state.querySorts)
  
  const setQueryTable = useStore(state => state.setQueryTable)
  const addQueryJoin = useStore(state => state.addQueryJoin)
  const updateQueryJoin = useStore(state => state.updateQueryJoin)
  const removeQueryJoin = useStore(state => state.removeQueryJoin)
  const addQuerySelection = useStore(state => state.addQuerySelection)
  const updateQuerySelection = useStore(state => state.updateQuerySelection)
  const removeQuerySelection = useStore(state => state.removeQuerySelection)
  const addQueryCondition = useStore(state => state.addQueryCondition)
  const updateQueryCondition = useStore(state => state.updateQueryCondition)
  const removeQueryCondition = useStore(state => state.removeQueryCondition)
  const setLogicalOperator = useStore(state => state.setLogicalOperator)
  const addQuerySort = useStore(state => state.addQuerySort)
  const updateQuerySort = useStore(state => state.updateQuerySort)
  const removeQuerySort = useStore(state => state.removeQuerySort)

  // Calcular tablas unidas (JOIN) manualmente usando queryJoins
  const joinedData = useMemo(() => {
    if (!selectedQueryTable) return { tables: [], joins: [] }
    
    const tablesMap = new Map<string, any>()
    const joins: { sourceTable: string, targetTable: string, sourceCol: string, targetCol: string }[] = []
    
    const primaryNode = nodes.find(n => n.id === selectedQueryTable)
    if (primaryNode) tablesMap.set(primaryNode.id, primaryNode.data)

    queryJoins.forEach(join => {
      if (!join.joinTableId || !join.sourceTableId || !join.sourceColumn || !join.targetColumn) return;
      
      const targetNode = nodes.find(n => n.id === join.joinTableId)
      if (targetNode) tablesMap.set(join.joinTableId, targetNode.data)

      joins.push({
        sourceTable: join.sourceTableId,
        targetTable: join.joinTableId,
        sourceCol: join.sourceColumn,
        targetCol: join.targetColumn
      })
    })

    return { 
      tables: Array.from(tablesMap.values()), 
      joins 
    }
  }, [nodes, selectedQueryTable, queryJoins])

  // Obtener todas las columnas disponibles de las tablas unidas
  const availableColumns = useMemo(() => {
    const cols: { tableId: string, tableName: string, columnName: string, type: string, uniqueId: string }[] = []
    joinedData.tables.forEach(t => {
      t.columns.forEach((c: any) => {
        cols.push({ tableId: t.id, tableName: t.name, columnName: c.name, type: c.type, uniqueId: `${t.id}.${c.name}` })
      })
    })
    return cols
  }, [joinedData])

  const getOpOptions = (tableId: string, colName: string) => {
    const col = availableColumns.find(c => c.tableId === tableId && c.columnName === colName)
    if (!col) return []
    const t = col.type as DataType
    if (t === 'Boolean') return [{ val: 'IS_TRUE', label: 'Es verdadero' }, { val: 'IS_FALSE', label: 'Es falso' }]
    if (t === 'Varchar') return [{ val: '=', label: 'Es igual a' }, { val: 'CONTAINS', label: 'Contiene' }]
    return [{ val: '=', label: 'Es igual a' }, { val: '>', label: 'Es mayor a' }, { val: '<', label: 'Es menor a' }]
  }

  const sqlTranslation = useMemo(() => {
    if (!selectedQueryTable || joinedData.tables.length === 0) return "Selecciona una tabla..."
    
    // SELECT & GROUP BY
    let selectClause = "*"
    let groupByClause = ""
    if (querySelections.length > 0) {
      const sels = querySelections.map(s => {
        const table = joinedData.tables.find(t => t.id === s.tableId)
        const prefix = table ? `${table.name}.` : ''
        if (s.aggregation && s.aggregation !== 'NONE') {
          return `${s.aggregation}(${prefix}${s.columnName})`
        }
        return `${prefix}${s.columnName}`
      })
      selectClause = sels.join(', ')

      const hasAgg = querySelections.some(s => s.aggregation && s.aggregation !== 'NONE')
      const nonAgg = querySelections.filter(s => !s.aggregation || s.aggregation === 'NONE')
      if (hasAgg && nonAgg.length > 0) {
        groupByClause = `\nGROUP BY ` + nonAgg.map(s => {
           const table = joinedData.tables.find(t => t.id === s.tableId)
           return `${table ? table.name + '.' : ''}${s.columnName}`
        }).join(', ')
      }
    }

    const primaryTable = joinedData.tables.find(t => t.id === selectedQueryTable)
    let sql = `SELECT ${selectClause} \nFROM ${primaryTable?.name}`
    
    // JOINs
    joinedData.joins.forEach(j => {
      const sTable = joinedData.tables.find(t => t.id === j.sourceTable)
      const tTable = joinedData.tables.find(t => t.id === j.targetTable)
      if (sTable && tTable) {
        sql += `\n  INNER JOIN ${tTable.name} ON ${sTable.name}.${j.sourceCol} = ${tTable.name}.${j.targetCol}`
      }
    })
    
    // WHERE
    if (queryConditions.length > 0) {
      const conds = queryConditions.map(c => {
        if (!c.column || !c.operator) return '...'
        const colDef = availableColumns.find(ac => ac.tableId === c.tableId && ac.columnName === c.column)
        const colType = colDef?.type
        let valStr = String(c.value || '')
        if (colType === 'Varchar' || colType === 'Date') valStr = `'${valStr}'`
        
        const prefix = colDef ? `${colDef.tableName}.` : ''
        const fullCol = `${prefix}${c.column}`

        if (c.operator === 'IS_TRUE') return `${fullCol} = true`
        if (c.operator === 'IS_FALSE') return `${fullCol} = false`
        if (c.operator === 'CONTAINS') return `${fullCol} LIKE '%${c.value}%'`
        return `${fullCol} ${c.operator} ${valStr}`
      })
      sql += `\nWHERE \n  ${conds.join(` \n  ${logicalOperator} `)}`
    }
    
    if (groupByClause) {
      sql += groupByClause
    }

    // ORDER BY
    if (querySorts.length > 0) {
      const sorts = querySorts.map(s => {
        const table = joinedData.tables.find(t => t.id === s.tableId)
        return `${table ? table.name + '.' : ''}${s.column} ${s.direction}`
      })
      sql += `\nORDER BY ${sorts.join(', ')}`
    }
    
    return sql + ";"
  }, [selectedQueryTable, joinedData, querySelections, queryConditions, logicalOperator, querySorts, availableColumns])

  const naturalTranslation = useMemo(() => {
    if (!selectedQueryTable || joinedData.tables.length === 0) return "Selecciona una tabla para empezar."
    
    const primaryTable = joinedData.tables.find(t => t.id === selectedQueryTable)
    let text = `Consultar `
    
    if (querySelections.length > 0) {
      const sels = querySelections.map(s => {
        const table = joinedData.tables.find(t => t.id === s.tableId)
        const aggMap: Record<string, string> = { 'COUNT': 'la cantidad de', 'SUM': 'la suma de', 'AVG': 'el promedio de', 'MAX': 'el máximo de', 'MIN': 'el mínimo de' }
        const aggPrefix = s.aggregation && s.aggregation !== 'NONE' ? aggMap[s.aggregation] + ' ' : ''
        return `${aggPrefix}[${s.columnName}] (de ${table?.name})`
      })
      text += sels.join(', ') + `\n`
    } else {
      text += `toda la información\n`
    }
    
    text += `desde la tabla "${primaryTable?.name}"`

    if (joinedData.joins.length > 0) {
      text += `\nconectada con:\n`
      joinedData.joins.forEach(j => {
         const tTable = joinedData.tables.find(t => t.id === j.targetTable)
         text += ` - ${tTable?.name}\n`
      })
    }

    if (queryConditions.length > 0) {
      const conds = queryConditions.map(c => {
        if (!c.column || !c.operator) return '...'
        const colDef = availableColumns.find(ac => ac.tableId === c.tableId && ac.columnName === c.column)
        const opLabel = getOpOptions(c.tableId, c.column).find(o => o.val === c.operator)?.label?.toLowerCase() || ''
        const prefix = colDef ? `${colDef.tableName}.` : ''
        
        if (c.operator === 'IS_TRUE' || c.operator === 'IS_FALSE') {
           return `[${prefix}${c.column}] ${opLabel}`
        }
        return `[${prefix}${c.column}] ${opLabel} "${c.value || ''}"`
      })
      text += `\ndonde se cumpla ${logicalOperator === 'AND' ? 'TODA' : 'ALGUNA'} de estas condiciones:\n - ` + conds.join(`\n - `)
    }

    const hasAgg = querySelections.some(s => s.aggregation && s.aggregation !== 'NONE')
    const nonAgg = querySelections.filter(s => !s.aggregation || s.aggregation === 'NONE')
    if (hasAgg && nonAgg.length > 0) {
      text += `\nagrupando los resultados por: ` + nonAgg.map(s => `[${s.columnName}]`).join(', ')
    }
    
    if (querySorts.length > 0) {
      const sorts = querySorts.map(s => {
        const table = joinedData.tables.find(t => t.id === s.tableId)
        return `[${table ? table.name + '.' : ''}${s.column}] de ${s.direction === 'ASC' ? 'menor a mayor' : 'mayor a menor'}`
      })
      text += `\nordenado por: ` + sorts.join(', ')
    }
    
    return text
  }, [selectedQueryTable, joinedData, querySelections, queryConditions, logicalOperator, querySorts, availableColumns])

  return (
    <div className="flex flex-col h-full bg-muted/10 overflow-hidden">
      <div className="flex-1 overflow-auto p-4 flex flex-col gap-6">
        
        {/* Table Selector */}
        <div>
          <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 block">1. Tabla Principal (FROM)</label>
          <select 
            className="w-full bg-background border border-input rounded p-2 text-sm font-semibold"
            value={selectedQueryTable || ''}
            onChange={(e) => setQueryTable(e.target.value)}
          >
            <option value="">-- Tabla --</option>
            {nodes.map(n => <option key={n.id} value={n.id}>{(n.data as any).name}</option>)}
          </select>
        </div>

        {selectedQueryTable && (
          <>
            {/* JOINs Manuales */}
            <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">2. Uniones (JOIN)</label>
                 <Button variant="outline" size="sm" onClick={() => addQueryJoin({ joinTableId: '', sourceTableId: selectedQueryTable, sourceColumn: '', targetColumn: '' })} className="h-7 text-xs">
                    <Plus size={12} className="mr-1" /> Añadir JOIN
                 </Button>
              </div>

              <div className="flex flex-col gap-2">
                {queryJoins.map((join) => {
                  const sourceTableNode = nodes.find(n => n.id === join.sourceTableId)
                  const targetTableNode = nodes.find(n => n.id === join.joinTableId)
                  const sourceCols = (sourceTableNode?.data as any)?.columns || []
                  const targetCols = (targetTableNode?.data as any)?.columns || []
                  const primaryNode = nodes.find(n => n.id === selectedQueryTable)

                  return (
                    <div key={join.id} className="flex flex-wrap items-center gap-2 bg-background p-2 border rounded-md shadow-sm">
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-1 py-0.5 rounded">INNER JOIN</span>
                        <select 
                          className="flex-1 min-w-[120px] bg-muted/50 border rounded p-1.5 text-xs text-foreground font-semibold"
                          value={join.joinTableId}
                          onChange={(e) => updateQueryJoin(join.id, { joinTableId: e.target.value, targetColumn: '' })}
                        >
                          <option value="">-- Tabla a unir --</option>
                          {nodes.filter(n => n.id !== selectedQueryTable).map(n => <option key={n.id} value={n.id}>{(n.data as any).name}</option>)}
                        </select>
                      </div>
                      
                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-[10px] font-bold text-muted-foreground">ON</span>
                        <select 
                          className="w-28 bg-muted/50 border rounded p-1.5 text-[10px] text-foreground truncate"
                          value={join.sourceTableId}
                          onChange={(e) => updateQueryJoin(join.id, { sourceTableId: e.target.value, sourceColumn: '' })}
                        >
                           <option value={selectedQueryTable}>{(primaryNode?.data as any)?.name}</option>
                           {queryJoins.filter(j => j.id !== join.id && j.joinTableId).map(j => {
                              const n = nodes.find(node => node.id === j.joinTableId)
                              return <option key={j.joinTableId} value={j.joinTableId}>{(n?.data as any)?.name}</option>
                           })}
                        </select>
                        
                        <span className="text-xs font-bold text-muted-foreground">.</span>
                        
                        <select 
                          className="w-24 bg-muted/50 border rounded p-1.5 text-[10px] text-foreground"
                          value={join.sourceColumn}
                          onChange={(e) => updateQueryJoin(join.id, { sourceColumn: e.target.value })}
                          disabled={!join.sourceTableId}
                        >
                          <option value="">-- Col --</option>
                          {sourceCols.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>
                      </div>

                      <div className="flex items-center gap-2 w-full sm:w-auto">
                        <span className="text-xs font-bold text-muted-foreground">=</span>
                        <span className="text-[10px] truncate max-w-[80px] text-muted-foreground">{(targetTableNode?.data as any)?.name || '...'} .</span>
                        <select 
                          className="w-24 bg-muted/50 border rounded p-1.5 text-[10px] text-foreground"
                          value={join.targetColumn}
                          onChange={(e) => updateQueryJoin(join.id, { targetColumn: e.target.value })}
                          disabled={!join.joinTableId}
                        >
                          <option value="">-- Col --</option>
                          {targetCols.map((c: any) => <option key={c.name} value={c.name}>{c.name}</option>)}
                        </select>

                        <Button variant="ghost" size="icon" onClick={() => removeQueryJoin(join.id)} className="h-8 w-8 ml-auto text-destructive shrink-0">
                          <Trash2 size={14} />
                        </Button>
                      </div>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Proyecciones (SELECT) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">3. Columnas (SELECT / GROUP BY)</label>
                 <Button variant="outline" size="sm" onClick={() => addQuerySelection({ tableId: '', columnName: '', aggregation: 'NONE' })} className="h-7 text-xs">
                    <Plus size={12} className="mr-1" /> Añadir Columna
                 </Button>
              </div>

              <div className="flex flex-col gap-2">
                {querySelections.length === 0 && (
                  <div className="text-xs text-muted-foreground p-3 bg-background border border-dashed rounded text-center">Sin columnas específicas (trae todas con *)</div>
                )}
                {querySelections.map((sel) => {
                  return (
                    <div key={sel.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-background p-2 border rounded-md shadow-sm">
                      <select 
                        className="flex-1 min-w-[120px] bg-muted/50 border rounded p-1.5 text-xs text-foreground"
                        value={sel.tableId && sel.columnName ? `${sel.tableId}.${sel.columnName}` : ''}
                        onChange={(e) => {
                            if(!e.target.value) {
                               updateQuerySelection(sel.id, { tableId: '', columnName: '' })
                               return;
                            }
                            const [tId, ...cName] = e.target.value.split('.')
                            updateQuerySelection(sel.id, { tableId: tId, columnName: cName.join('.') })
                        }}
                      >
                        <option value="">-- Columna --</option>
                        {availableColumns.map(col => <option key={col.uniqueId} value={col.uniqueId}>{col.tableName}.{col.columnName}</option>)}
                      </select>

                      <select 
                        className="w-40 bg-muted/50 border rounded p-1.5 text-xs text-foreground"
                        value={sel.aggregation || 'NONE'}
                        onChange={(e) => updateQuerySelection(sel.id, { aggregation: e.target.value as any })}
                      >
                        <option value="NONE">Sin agrupar</option>
                        <option value="COUNT">Contar (COUNT)</option>
                        <option value="SUM">Sumar (SUM)</option>
                        <option value="AVG">Promedio (AVG)</option>
                        <option value="MAX">Máximo (MAX)</option>
                        <option value="MIN">Mínimo (MIN)</option>
                      </select>

                      <Button variant="ghost" size="icon" onClick={() => removeQuerySelection(sel.id)} className="h-8 w-8 text-destructive shrink-0">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Filters (WHERE) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">4. Filtros (WHERE)</label>
                 <Button variant="outline" size="sm" onClick={() => addQueryCondition({ tableId: '', column: '', operator: '', value: '' })} className="h-7 text-xs">
                    <Plus size={12} className="mr-1" /> Añadir Condición
                 </Button>
              </div>

              {queryConditions.length > 1 && (
                <div className="flex items-center gap-2 mb-3 bg-indigo-50 dark:bg-indigo-950 p-2 rounded-md border border-indigo-100 dark:border-indigo-900 w-fit">
                   <span className="text-xs font-semibold text-indigo-800 dark:text-indigo-200">Unir con:</span>
                   <select 
                      className="text-xs bg-background border rounded px-2 py-1 font-bold text-indigo-700 mx-2"
                      value={logicalOperator}
                      onChange={(e) => setLogicalOperator(e.target.value as 'AND' | 'OR')}
                   >
                     <option value="AND">Y (Se cumplen TODAS)</option>
                     <option value="OR">O (Se cumple ALGUNA)</option>
                   </select>
                </div>
              )}

              <div className="flex flex-col gap-2">
                {queryConditions.length === 0 && (
                  <div className="text-xs text-muted-foreground p-3 bg-background border border-dashed rounded text-center">Sin filtros (trae todos los registros)</div>
                )}
                {queryConditions.map((c) => {
                  const opts = getOpOptions(c.tableId, c.column)
                  const isBooleanOp = c.operator === 'IS_TRUE' || c.operator === 'IS_FALSE'
                  
                  return (
                    <div key={c.id} className="flex flex-wrap sm:flex-nowrap items-center gap-2 bg-background p-2 border rounded-md shadow-sm">
                      <select 
                        className="flex-1 min-w-[120px] bg-muted/50 border rounded p-1.5 text-xs text-foreground"
                        value={c.tableId && c.column ? `${c.tableId}.${c.column}` : ''}
                        onChange={(e) => {
                            if(!e.target.value) {
                               updateQueryCondition(c.id, { tableId: '', column: '', operator: '', value: '' })
                               return;
                            }
                            const [tId, ...cName] = e.target.value.split('.')
                            updateQueryCondition(c.id, { tableId: tId, column: cName.join('.'), operator: '', value: '' })
                        }}
                      >
                        <option value="">-- Columna --</option>
                        {availableColumns.map(col => <option key={col.uniqueId} value={col.uniqueId}>{col.tableName}.{col.columnName}</option>)}
                      </select>

                      <select 
                        className="flex-1 min-w-[120px] bg-muted/50 border rounded p-1.5 text-xs text-foreground"
                        value={c.operator}
                        onChange={(e) => updateQueryCondition(c.id, { operator: e.target.value })}
                        disabled={!c.column}
                      >
                        <option value="">-- Operador --</option>
                        {opts.map(o => <option key={o.val} value={o.val}>{o.label}</option>)}
                      </select>

                      {!isBooleanOp && (
                        <Input 
                          placeholder="Valor..."
                          value={String(c.value) || ''}
                          onChange={(e) => updateQueryCondition(c.id, { value: e.target.value })}
                          disabled={!c.operator}
                          className="flex-1 min-w-[120px] h-8 text-xs bg-muted/50"
                        />
                      )}

                      <Button variant="ghost" size="icon" onClick={() => removeQueryCondition(c.id)} className="h-8 w-8 text-destructive shrink-0">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>

            {/* Sorter (ORDER BY) */}
            <div>
              <div className="flex items-center justify-between mb-2">
                 <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider">5. Ordenamiento (ORDER BY)</label>
                 <Button variant="outline" size="sm" onClick={() => addQuerySort({ tableId: '', column: '', direction: 'ASC' })} className="h-7 text-xs">
                    <Plus size={12} className="mr-1" /> Añadir Ordenamiento
                 </Button>
              </div>

              <div className="flex flex-col gap-2">
                {querySorts.length === 0 && (
                  <div className="text-xs text-muted-foreground p-3 bg-background border border-dashed rounded text-center">Sin orden específico</div>
                )}
                {querySorts.map((sort, index) => {
                  return (
                    <div key={index} className="flex items-center gap-2 bg-background p-2 border rounded-md shadow-sm">
                      <select 
                        className="flex-1 bg-muted/50 border rounded p-1.5 text-xs text-foreground"
                        value={sort.tableId && sort.column ? `${sort.tableId}.${sort.column}` : ''}
                        onChange={(e) => {
                            if(!e.target.value) {
                               updateQuerySort(index, { ...sort, tableId: '', column: '' })
                               return;
                            }
                            const [tId, ...cName] = e.target.value.split('.')
                            updateQuerySort(index, { ...sort, tableId: tId, column: cName.join('.') })
                        }}
                      >
                        <option value="">-- Columna --</option>
                        {availableColumns.map(col => <option key={col.uniqueId} value={col.uniqueId}>{col.tableName}.{col.columnName}</option>)}
                      </select>

                      <select 
                        className="w-32 bg-muted/50 border rounded p-1.5 text-xs font-semibold text-foreground"
                        value={sort.direction}
                        onChange={(e) => updateQuerySort(index, { ...sort, direction: e.target.value as 'ASC'|'DESC' })}
                      >
                        <option value="ASC">Ascendente</option>
                        <option value="DESC">Descendente</option>
                      </select>

                      <Button variant="ghost" size="icon" onClick={() => removeQuerySort(index)} className="h-8 w-8 text-destructive shrink-0">
                        <Trash2 size={14} />
                      </Button>
                    </div>
                  )
                })}
              </div>
            </div>
          </>
        )}

      </div>

      {/* Translations Output Section */}
      <div className="shrink-0 border-t bg-card grid grid-cols-1 md:grid-cols-2">
          <div className="p-3 border-b md:border-b-0 md:border-r border-border/50">
             <h4 className="text-[10px] uppercase font-bold text-indigo-500 mb-2 flex items-center gap-1"><TerminalSquare size={12}/> SQL Generado</h4>
             <pre className="text-[10px] font-mono text-indigo-200 bg-indigo-950 p-2 rounded w-full overflow-x-auto whitespace-pre-wrap leading-relaxed">{sqlTranslation}</pre>
          </div>
          <div className="p-3">
             <h4 className="text-[10px] uppercase font-bold text-emerald-500 mb-2 flex items-center gap-1"><MessageSquareText size={12}/> Lenguaje Natural</h4>
             <div className="text-xs text-emerald-800 dark:text-emerald-200 bg-emerald-50 dark:bg-emerald-950 p-2 rounded min-h-[50px] leading-relaxed whitespace-pre-wrap">
               {naturalTranslation}
             </div>
          </div>
      </div>
    </div>
  )
}
