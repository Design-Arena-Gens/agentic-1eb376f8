'use client'

import { motion } from 'framer-motion'
import { Brain, Lightbulb, Code, Heart, Zap, BookOpen, Plus } from 'lucide-react'
import { useState, useEffect } from 'react'

interface ModeSelectorProps {
  currentMode: string
  onModeChange: (mode: string) => void
}

interface Mode {
  id: string
  name: string
  icon: any
  color: string
  description: string
}

const defaultModes: Mode[] = [
  { id: 'general', name: 'General', icon: Brain, color: 'from-blue-500 to-blue-700', description: 'All-purpose assistant' },
  { id: 'creative', name: 'Creative', icon: Lightbulb, color: 'from-purple-500 to-purple-700', description: 'Ideas & imagination' },
  { id: 'technical', name: 'Technical', icon: Code, color: 'from-green-500 to-green-700', description: 'Tech & coding help' },
  { id: 'wellness', name: 'Wellness', icon: Heart, color: 'from-pink-500 to-pink-700', description: 'Health & mindfulness' },
  { id: 'productivity', name: 'Productivity', icon: Zap, color: 'from-yellow-500 to-yellow-700', description: 'Task optimization' },
  { id: 'learning', name: 'Learning', icon: BookOpen, color: 'from-indigo-500 to-indigo-700', description: 'Educational support' },
]

export default function ModeSelector({ currentMode, onModeChange }: ModeSelectorProps) {
  const [modes, setModes] = useState<Mode[]>(defaultModes)
  const [showAddMode, setShowAddMode] = useState(false)

  useEffect(() => {
    const savedModes = localStorage.getItem('custom_modes')
    if (savedModes) {
      try {
        const customModes = JSON.parse(savedModes)
        setModes([...defaultModes, ...customModes])
      } catch (e) {
        console.error('Failed to load custom modes', e)
      }
    }
  }, [])

  const addCustomMode = (name: string, description: string) => {
    const newMode: Mode = {
      id: name.toLowerCase().replace(/\s+/g, '_'),
      name,
      icon: Brain,
      color: 'from-cyan-500 to-cyan-700',
      description,
    }

    const customModes = modes.filter(m => !defaultModes.find(dm => dm.id === m.id))
    const updatedCustomModes = [...customModes, newMode]
    localStorage.setItem('custom_modes', JSON.stringify(updatedCustomModes))
    setModes([...defaultModes, ...updatedCustomModes])
    setShowAddMode(false)
  }

  return (
    <div className="px-4 py-4">
      <div className="flex items-center justify-between mb-3">
        <h2 className="text-white font-semibold text-sm">Select Mode</h2>
        <button
          onClick={() => setShowAddMode(true)}
          className="glass p-1.5 rounded-lg text-white hover:glow transition-all"
        >
          <Plus className="w-4 h-4" />
        </button>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
        {modes.map((mode) => {
          const Icon = mode.icon
          const isActive = currentMode === mode.id

          return (
            <motion.button
              key={mode.id}
              onClick={() => onModeChange(mode.id)}
              whileTap={{ scale: 0.95 }}
              className={`flex-shrink-0 relative ${
                isActive ? 'glass-dark' : 'glass'
              } rounded-xl p-3 min-w-[120px] transition-all hover:glow`}
            >
              {isActive && (
                <motion.div
                  layoutId="activeMode"
                  className="absolute inset-0 bg-primary-500/20 rounded-xl"
                  transition={{ type: 'spring', stiffness: 300, damping: 30 }}
                />
              )}
              <div className="relative">
                <div className={`bg-gradient-to-br ${mode.color} w-10 h-10 rounded-lg flex items-center justify-center mb-2 mx-auto`}>
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <p className="text-white text-xs font-medium text-center">{mode.name}</p>
                <p className="text-white/50 text-[10px] text-center mt-1">{mode.description}</p>
              </div>
            </motion.button>
          )
        })}
      </div>

      {/* Add Custom Mode Modal */}
      {showAddMode && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="glass-dark rounded-2xl p-6 max-w-md w-full"
          >
            <h3 className="text-white text-lg font-bold mb-4">Add Custom Mode</h3>
            <input
              id="mode-name"
              type="text"
              placeholder="Mode Name"
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-3"
            />
            <input
              id="mode-desc"
              type="text"
              placeholder="Description"
              className="w-full px-4 py-2 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500 mb-4"
            />
            <div className="flex gap-3">
              <button
                onClick={() => {
                  const name = (document.getElementById('mode-name') as HTMLInputElement).value
                  const desc = (document.getElementById('mode-desc') as HTMLInputElement).value
                  if (name && desc) addCustomMode(name, desc)
                }}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Add Mode
              </button>
              <button
                onClick={() => setShowAddMode(false)}
                className="flex-1 glass hover:bg-white/20 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </motion.div>
        </div>
      )}

      <style jsx>{`
        .scrollbar-hide::-webkit-scrollbar {
          display: none;
        }
        .scrollbar-hide {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
      `}</style>
    </div>
  )
}
