'use client'

import { useState, useEffect } from 'react'
import { X, Save, Wand2, Code, Database, Plug, Sparkles } from 'lucide-react'
import { motion } from 'framer-motion'

interface AgenticDesignerProps {
  onClose: () => void
}

interface Enhancement {
  id: string
  title: string
  description: string
  type: 'feature' | 'mode' | 'api' | 'mcp'
  code?: string
  implemented: boolean
}

export default function AgenticDesigner({ onClose }: AgenticDesignerProps) {
  const [enhancements, setEnhancements] = useState<Enhancement[]>([])
  const [prompt, setPrompt] = useState('')
  const [isGenerating, setIsGenerating] = useState(false)
  const [selectedTab, setSelectedTab] = useState<'features' | 'modes' | 'apis' | 'mcp'>('features')

  useEffect(() => {
    const saved = localStorage.getItem('agentic_enhancements')
    if (saved) {
      try {
        setEnhancements(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load enhancements', e)
      }
    }
  }, [])

  const saveEnhancements = (data: Enhancement[]) => {
    localStorage.setItem('agentic_enhancements', JSON.stringify(data))
    setEnhancements(data)
  }

  const generateEnhancement = async () => {
    if (!prompt.trim()) return

    setIsGenerating(true)

    // Simulate AI generation for demo purposes
    setTimeout(() => {
      const newEnhancement: Enhancement = {
        id: Date.now().toString(),
        title: `Enhancement: ${prompt.substring(0, 50)}`,
        description: `AI-generated enhancement based on: "${prompt}". This would add new functionality to improve the assistant's capabilities.`,
        type: selectedTab === 'features' ? 'feature' : selectedTab === 'modes' ? 'mode' : selectedTab === 'apis' ? 'api' : 'mcp',
        code: `// Generated code for: ${prompt}\n// This is a placeholder for actual implementation\n\nexport const enhancement = {\n  name: '${prompt}',\n  handler: async () => {\n    // Implementation here\n  }\n}`,
        implemented: false,
      }

      saveEnhancements([...enhancements, newEnhancement])
      setPrompt('')
      setIsGenerating(false)
    }, 2000)
  }

  const toggleImplementation = (id: string) => {
    const updated = enhancements.map(e =>
      e.id === id ? { ...e, implemented: !e.implemented } : e
    )
    saveEnhancements(updated)
  }

  const deleteEnhancement = (id: string) => {
    saveEnhancements(enhancements.filter(e => e.id !== id))
  }

  const filteredEnhancements = enhancements.filter(e => {
    if (selectedTab === 'features') return e.type === 'feature'
    if (selectedTab === 'modes') return e.type === 'mode'
    if (selectedTab === 'apis') return e.type === 'api'
    if (selectedTab === 'mcp') return e.type === 'mcp'
    return true
  })

  const tabs = [
    { id: 'features', label: 'Features', icon: Sparkles },
    { id: 'modes', label: 'Modes', icon: Code },
    { id: 'apis', label: 'APIs', icon: Plug },
    { id: 'mcp', label: 'MCP', icon: Database },
  ] as const

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="absolute inset-0 z-40 flex flex-col bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900"
    >
      {/* Header */}
      <div className="glass-dark px-4 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-purple-500 to-pink-600 p-2 rounded-xl">
            <Wand2 className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-lg">Agentic Designer</h2>
            <p className="text-purple-300 text-xs">Self-improving AI system</p>
          </div>
        </div>
        <button
          onClick={onClose}
          className="glass p-2 rounded-lg text-white hover:bg-white/20 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 px-4 py-3 border-b border-white/10">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setSelectedTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg transition-all ${
                selectedTab === tab.id
                  ? 'bg-purple-500 text-white'
                  : 'glass text-white/70 hover:text-white'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="text-sm font-medium">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {/* Generation Input */}
        <div className="glass-dark rounded-2xl p-4">
          <h3 className="text-white font-semibold mb-3 flex items-center gap-2">
            <Wand2 className="w-4 h-4" />
            Generate Enhancement
          </h3>
          <p className="text-white/70 text-sm mb-3">
            Describe what you want to add. The AI will generate code and implementations.
          </p>
          <textarea
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            placeholder={`Example: Add a meditation timer mode with breathing exercises`}
            className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none"
            rows={3}
          />
          <button
            onClick={generateEnhancement}
            disabled={isGenerating || !prompt.trim()}
            className="mt-3 w-full bg-gradient-to-r from-purple-500 to-pink-600 hover:from-purple-600 hover:to-pink-700 disabled:from-gray-500 disabled:to-gray-600 text-white py-3 rounded-lg font-medium transition-all flex items-center justify-center gap-2"
          >
            {isGenerating ? (
              <>
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="w-4 h-4" />
                Generate Enhancement
              </>
            )}
          </button>
        </div>

        {/* Enhancement List */}
        <div className="space-y-3">
          {filteredEnhancements.length === 0 ? (
            <div className="glass-dark rounded-2xl p-8 text-center">
              <Wand2 className="w-12 h-12 text-white/30 mx-auto mb-3" />
              <p className="text-white/70">No {selectedTab} yet</p>
              <p className="text-white/50 text-sm mt-1">Generate your first enhancement above</p>
            </div>
          ) : (
            filteredEnhancements.map((enhancement) => (
              <motion.div
                key={enhancement.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="glass-dark rounded-2xl p-4"
              >
                <div className="flex items-start justify-between mb-2">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h4 className="text-white font-semibold">{enhancement.title}</h4>
                      {enhancement.implemented && (
                        <span className="px-2 py-0.5 bg-green-500/20 text-green-300 text-xs rounded-full">
                          Active
                        </span>
                      )}
                    </div>
                    <p className="text-white/70 text-sm">{enhancement.description}</p>
                  </div>
                  <button
                    onClick={() => deleteEnhancement(enhancement.id)}
                    className="text-white/50 hover:text-red-400 transition-colors p-1"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {enhancement.code && (
                  <details className="mt-3">
                    <summary className="text-purple-300 text-sm cursor-pointer hover:text-purple-200">
                      View generated code
                    </summary>
                    <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-white/80 overflow-x-auto">
                      {enhancement.code}
                    </pre>
                  </details>
                )}

                <div className="flex gap-2 mt-3">
                  <button
                    onClick={() => toggleImplementation(enhancement.id)}
                    className={`flex-1 py-2 rounded-lg font-medium transition-all ${
                      enhancement.implemented
                        ? 'bg-green-500/20 text-green-300 hover:bg-green-500/30'
                        : 'bg-purple-500 hover:bg-purple-600 text-white'
                    }`}
                  >
                    {enhancement.implemented ? 'Deactivate' : 'Activate'}
                  </button>
                  <button className="glass hover:bg-white/20 px-4 py-2 rounded-lg text-white transition-colors">
                    <Save className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            ))
          )}
        </div>

        {/* Info Box */}
        <div className="glass-dark rounded-2xl p-4 border-l-4 border-purple-500">
          <h4 className="text-white font-semibold mb-2 flex items-center gap-2">
            <Sparkles className="w-4 h-4" />
            How it works
          </h4>
          <ul className="text-white/70 text-sm space-y-1">
            <li>• Describe new features, modes, or integrations</li>
            <li>• AI generates implementation code</li>
            <li>• Review and activate enhancements</li>
            <li>• System improves itself over time</li>
          </ul>
        </div>
      </div>
    </motion.div>
  )
}
