import { useState, useRef, useEffect } from 'react'
import { useT } from '../../i18n'
import { useAuth } from '../../stores/AuthContext'
import { api } from '../../api/client'

export default function UserMenu() {
  const { t } = useT()
  const { user, logout } = useAuth()
  const [open, setOpen] = useState(false)
  const [toast, setToast] = useState(null)
  const menuRef = useRef(null)
  const fileRef = useRef(null)

  // Close dropdown on outside click
  useEffect(() => {
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false)
      }
    }
    if (open) document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [open])

  // Auto-dismiss toast
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(null), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  async function handleExport() {
    setOpen(false)
    try {
      // Raw fetch instead of api() client — we need a blob response for file download.
      // Trade-off: no automatic token refresh on 401.
      const token = localStorage.getItem('lm_access_token')
      const res = await fetch('/api/export', {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (!res.ok) throw new Error(`${res.status}`)
      const blob = await res.blob()
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = res.headers.get('Content-Disposition')?.match(/filename="(.+)"/)?.[1]
        || `languageme-backup-${new Date().toISOString().slice(0, 10)}.json`
      a.click()
      URL.revokeObjectURL(url)
    } catch (err) {
      setToast({ type: 'error', msg: t('export_error', { message: err.message }) })
    }
  }

  function handleImportClick() {
    setOpen(false)
    fileRef.current?.click()
  }

  async function handleFileChange(e) {
    const file = e.target.files?.[0]
    e.target.value = '' // reset so same file can be re-selected
    if (!file) return

    if (!file.name.endsWith('.json')) {
      setToast({ type: 'error', msg: t('import_file_error') })
      return
    }

    try {
      const text = await file.text()
      let data
      try {
        data = JSON.parse(text)
      } catch {
        setToast({ type: 'error', msg: t('import_file_error') })
        return
      }

      const result = await api.post('/api/import', data)
      const totalSkipped = result.skipped.srsCards + result.skipped.themeProgress + result.skipped.mnemonics
      setToast({
        type: 'success',
        msg: t('import_success', {
          cards: result.imported.srsCards,
          themes: result.imported.themeProgress,
          mnemonics: result.imported.mnemonics,
          skipped: totalSkipped,
        }),
      })
    } catch (err) {
      const message = err.data?.error || err.message
      setToast({ type: 'error', msg: t('import_error', { message }) })
    }
  }

  return (
    <>
      <div className="relative" ref={menuRef}>
        <button
          onClick={() => setOpen(o => !o)}
          className="flex items-center gap-2 text-sm text-text-muted hover:text-text-primary transition-colors"
          aria-label="User menu"
        >
          <span className="truncate max-w-[120px]">{user?.display_name || user?.email}</span>
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {open && (
          <div className="absolute right-0 top-full mt-1 w-48 bg-surface border border-border rounded-lg shadow-lg py-1 z-50">
            <button
              onClick={handleExport}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover transition-colors"
            >
              {t('user_menu_export')}
            </button>
            <button
              onClick={handleImportClick}
              className="w-full text-left px-4 py-2 text-sm text-text-primary hover:bg-surface-hover transition-colors"
            >
              {t('user_menu_import')}
            </button>
            <div className="border-t border-border my-1" />
            <button
              onClick={() => { setOpen(false); logout() }}
              className="w-full text-left px-4 py-2 text-sm text-red-400 hover:bg-surface-hover transition-colors"
            >
              {t('auth_logout')}
            </button>
          </div>
        )}
      </div>

      <input
        ref={fileRef}
        type="file"
        accept=".json"
        className="hidden"
        onChange={handleFileChange}
      />

      {toast && (
        <div className={`fixed bottom-4 left-1/2 -translate-x-1/2 z-[100] max-w-md px-4 py-3 rounded-lg shadow-lg text-sm
          ${toast.type === 'success' ? 'bg-green-900/90 text-green-100 border border-green-700' : 'bg-red-900/90 text-red-100 border border-red-700'}`}
        >
          {toast.msg}
        </div>
      )}
    </>
  )
}
