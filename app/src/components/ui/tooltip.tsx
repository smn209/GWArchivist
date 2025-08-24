"use client"

import React, { createContext, useContext, useState, useRef, useEffect } from 'react'

interface TooltipContextValue {
  isOpen: boolean
  setIsOpen: (open: boolean) => void
  position: { x: number; y: number }
  setPosition: (position: { x: number; y: number }) => void
}

const TooltipContext = createContext<TooltipContextValue | undefined>(undefined)

interface TooltipProps {
  children: React.ReactNode
  delayDuration?: number
}

interface TooltipTriggerProps {
  children: React.ReactNode
  asChild?: boolean
}

interface TooltipContentProps {
  children: React.ReactNode
  side?: 'top' | 'bottom' | 'left' | 'right'
  sideOffset?: number
}

export function Tooltip({ children }: TooltipProps) {
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState({ x: 0, y: 0 })

  return (
    <TooltipContext.Provider value={{ isOpen, setIsOpen, position, setPosition }}>
      {children}
    </TooltipContext.Provider>
  )
}

export function TooltipTrigger({ children, asChild = false }: TooltipTriggerProps) {
  const context = useContext(TooltipContext)
  if (!context) throw new Error('TooltipTrigger must be used within Tooltip')

  const { setIsOpen, setPosition } = context
  const triggerRef = useRef<HTMLDivElement>(null)
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | undefined>(undefined)

  const handleMouseEnter = () => {
    const rect = triggerRef.current?.getBoundingClientRect()
    if (rect) {
      setPosition({
        x: rect.left + rect.width / 2,
        y: rect.top - 10
      })
    }

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setIsOpen(true)
    }, 200)
  }

  const handleMouseLeave = () => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    setIsOpen(false)
  }

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
      }
    }
  }, [])

  if (asChild && React.isValidElement(children)) {
    return React.cloneElement(children, {
      ref: triggerRef,
      onMouseEnter: handleMouseEnter,
      onMouseLeave: handleMouseLeave,
    } as React.HTMLAttributes<HTMLElement>)
  }

  return (
    <div
      ref={triggerRef}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className="inline-block"
    >
      {children}
    </div>
  )
}

export function TooltipContent({ children, side = 'top', sideOffset = 4 }: TooltipContentProps) {
  const context = useContext(TooltipContext)
  if (!context) throw new Error('TooltipContent must be used within Tooltip')

  const { isOpen, position } = context

  if (!isOpen) return null

  const getTransform = () => {
    switch (side) {
      case 'top':
        return 'translate(-50%, -100%)'
      case 'bottom':
        return 'translate(-50%, 0%)'
      case 'left':
        return 'translate(-100%, -50%)'
      case 'right':
        return 'translate(0%, -50%)'
      default:
        return 'translate(-50%, -100%)'
    }
  }

  const getArrowPosition = () => {
    switch (side) {
      case 'top':
        return 'absolute -bottom-1 left-1/2 transform -translate-x-1/2'
      case 'bottom':
        return 'absolute -top-1 left-1/2 transform -translate-x-1/2'
      case 'left':
        return 'absolute -right-1 top-1/2 transform -translate-y-1/2'
      case 'right':
        return 'absolute -left-1 top-1/2 transform -translate-y-1/2'
      default:
        return 'absolute -bottom-1 left-1/2 transform -translate-x-1/2'
    }
  }

  return (
    <div
      className="fixed z-50 pointer-events-none transition-all duration-300 ease-out animate-slide-up"
      style={{
        left: position.x,
        top: position.y - sideOffset,
        transform: getTransform()
      }}
    >
      <div className="bg-white border border-gray-200 text-gray-900 text-sm rounded-lg shadow-xl backdrop-blur-sm">
        <div className="relative">
          {children}
          <div className={`w-2 h-2 bg-white border-l border-t border-gray-200 rotate-45 ${getArrowPosition()}`} />
        </div>
      </div>
    </div>
  )
}
