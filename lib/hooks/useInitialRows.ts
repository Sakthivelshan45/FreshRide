'use client'

import { useCallback, useState, type Dispatch, type SetStateAction } from 'react'

export function useInitialRows<Row>(initialRows: Row[]) {
  const [state, setState] = useState({ source: initialRows, rows: initialRows })
  const rows = state.source === initialRows ? state.rows : initialRows

  const setRows = useCallback<Dispatch<SetStateAction<Row[]>>>((update) => {
    setState((current) => {
      const currentRows = current.source === initialRows ? current.rows : initialRows
      return {
        source: initialRows,
        rows: typeof update === 'function' ? update(currentRows) : update,
      }
    })
  }, [initialRows])

  return [rows, setRows] as const
}
