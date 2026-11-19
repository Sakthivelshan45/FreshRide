'use client'

import { createPortal } from 'react-dom'
import { useEffect, useId, useRef, useState } from 'react'

type DeleteProductDialogProps = {
  open: boolean
  productName: string
  onConfirm: () => Promise<void>
  onCancel: () => void
}

export default function DeleteProductDialog({
  open,
  productName,
  onConfirm,
  onCancel,
}: DeleteProductDialogProps) {
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const dialogRef = useRef<HTMLDivElement>(null)
  const keepButtonRef = useRef<HTMLButtonElement>(null)
  const deleteButtonRef = useRef<HTMLButtonElement>(null)
  const titleId = useId()
  const descriptionId = useId()

  useEffect(() => {
    if (!open) return

    const previouslyFocused = document.activeElement instanceof HTMLElement
      ? document.activeElement
      : null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    keepButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = previousOverflow
      if (previouslyFocused?.isConnected) previouslyFocused.focus()
    }
  }, [open])

  const closeDialog = () => {
    setError(null)
    onCancel()
  }

  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape') {
      event.preventDefault()
      if (!deleting) closeDialog()
      return
    }

    if (event.key !== 'Tab') return

    const focusableButtons = [keepButtonRef.current, deleteButtonRef.current]
      .filter((button): button is HTMLButtonElement => Boolean(button && !button.disabled))
    if (focusableButtons.length === 0) {
      event.preventDefault()
      dialogRef.current?.focus()
      return
    }

    const firstButton = focusableButtons[0]
    const lastButton = focusableButtons[focusableButtons.length - 1]
    if (event.shiftKey && document.activeElement === firstButton) {
      event.preventDefault()
      lastButton.focus()
    } else if (!event.shiftKey && document.activeElement === lastButton) {
      event.preventDefault()
      firstButton.focus()
    }
  }

  const handleConfirm = async () => {
    setDeleting(true)
    setError(null)
    dialogRef.current?.focus()

    try {
      await onConfirm()
      closeDialog()
    } catch (confirmError) {
      console.error('Product deletion failed:', confirmError)
      setError(
        confirmError instanceof Error
          ? confirmError.message
          : 'Could not delete product. Please try again.'
      )
    } finally {
      setDeleting(false)
    }
  }

  if (!open || typeof document === 'undefined') return null

  return createPortal(
    <div
      className="fixed inset-0 z-[100] grid min-h-full place-items-center overflow-y-auto bg-navy-dark/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget && !deleting) {
          closeDialog()
        }
      }}
    >
      <div
        ref={dialogRef}
        role="alertdialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descriptionId}
        tabIndex={-1}
        onKeyDown={handleKeyDown}
        className="delete-product-dialog-enter my-auto w-[420px] max-w-[calc(100vw-32px)] rounded-[28px] bg-light-bg px-8 pb-7 text-center shadow-[0_24px_70px_rgba(23,35,45,0.28)] outline-none"
      >
        <div className="-mt-[90px] mb-2 flex justify-center">
          <svg aria-hidden="true" width="150" height="130" viewBox="0 0 150 130">
            <ellipse cx="75" cy="120" rx="48" ry="7" fill="#E8EEF0" />
            <path d="M30 52 L75 34 L120 52 L120 108 L75 120 L30 108 Z" fill="#8FB99A" />
            <path d="M30 52 L75 70 L120 52 L75 34 Z" fill="#4A7C59" />
            <path d="M75 70 L75 120 L30 108 L30 52 Z" fill="#1A4731" />
            <path d="M62 41 L88 51 L88 62 L62 52 Z" fill="#F5F7F4" opacity="0.9" />
            <circle cx="52" cy="88" r="4.5" fill="#17232D" />
            <circle cx="98" cy="88" r="4.5" fill="#17232D" />
            <path d="M62 106 Q75 98 88 106" fill="none" stroke="#17232D" strokeWidth="3.5" strokeLinecap="round" />
            <path d="M92 72 Q101 74 106 84 Q100 86 96 80" fill="#4A7C59" />
          </svg>
        </div>

        <h2 id={titleId} className="font-serif text-[28px] font-extrabold leading-tight text-navy-dark">
          Wave goodbye?
        </h2>
        <p id={descriptionId} className="mt-2 text-sm leading-[1.55] text-green-secondary">
          {productName} will leave your store for good. Once it&apos;s gone, there&apos;s no bringing it back.
        </p>
        {error && (
          <p role="alert" className="mt-3 text-sm leading-[1.45] text-red-600">
            {error}
          </p>
        )}

        <div className="mt-4 flex flex-col gap-3.5">
          <button
            ref={keepButtonRef}
            type="button"
            onClick={closeDialog}
            disabled={deleting}
            className="flex min-h-[50px] w-full items-center justify-center rounded-full bg-green-primary px-5 text-sm font-semibold text-white transition-colors hover:bg-green-secondary focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-green-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            Keep it
          </button>
          <button
            ref={deleteButtonRef}
            type="button"
            onClick={handleConfirm}
            disabled={deleting}
            className="flex min-h-[50px] w-full items-center justify-center rounded-full border-2 border-red-600 bg-transparent px-5 text-sm font-semibold text-red-600 transition-colors hover:bg-red-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-600 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {deleting ? 'Deleting...' : 'Yes, delete it'}
          </button>
        </div>
      </div>
    </div>,
    document.body
  )
}
