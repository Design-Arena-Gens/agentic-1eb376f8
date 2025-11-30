'use client'

import { useState, useEffect } from 'react'
import VoiceAssistant from '@/components/VoiceAssistant'
import ModeSelector from '@/components/ModeSelector'
import AgenticDesigner from '@/components/AgenticDesigner'
import { Mic, Settings, Sparkles } from 'lucide-react'

export default function Home() {
  const [currentMode, setCurrentMode] = useState('general')
  const [showDesigner, setShowDesigner] = useState(false)
  const [apiKey, setApiKey] = useState('')
  const [showSettings, setShowSettings] = useState(false)

  useEffect(() => {
    const savedKey = localStorage.getItem('gemini_api_key')
    if (savedKey) setApiKey(savedKey)
  }, [])

  const saveApiKey = (key: string) => {
    localStorage.setItem('gemini_api_key', key)
    setApiKey(key)
    setShowSettings(false)
  }

  return (
    <main className="h-screen w-full flex flex-col overflow-hidden">
      {/* Header */}
      <header className="glass-dark px-4 py-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-2 rounded-xl">
            <Mic className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg text-shadow">Agentic AI</h1>
            <p className="text-primary-300 text-xs">Voice Assistant</p>
          </div>
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowDesigner(!showDesigner)}
            className="glass p-2 rounded-lg text-white hover:glow transition-all"
          >
            <Sparkles className="w-5 h-5" />
          </button>
          <button
            onClick={() => setShowSettings(!showSettings)}
            className="glass p-2 rounded-lg text-white hover:glow transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Settings Modal */}
      {showSettings && (
        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="glass-dark rounded-2xl p-6 max-w-md w-full">
            <h2 className="text-white text-xl font-bold mb-4">API Settings</h2>
            <input
              type="password"
              placeholder="Enter Gemini API Key"
              defaultValue={apiKey}
              className="w-full px-4 py-3 rounded-lg bg-white/10 border border-white/20 text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-primary-500"
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  saveApiKey(e.currentTarget.value)
                }
              }}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() => {
                  const input = document.querySelector('input[type="password"]') as HTMLInputElement
                  saveApiKey(input.value)
                }}
                className="flex-1 bg-primary-500 hover:bg-primary-600 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Save
              </button>
              <button
                onClick={() => setShowSettings(false)}
                className="flex-1 glass hover:bg-white/20 text-white py-2 rounded-lg font-medium transition-colors"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        {showDesigner ? (
          <AgenticDesigner onClose={() => setShowDesigner(false)} />
        ) : (
          <>
            <ModeSelector currentMode={currentMode} onModeChange={setCurrentMode} />
            <VoiceAssistant mode={currentMode} apiKey={apiKey} />
          </>
        )}
      </div>
    </main>
  )
}
