'use client'

import { useState, useRef, useEffect } from 'react'
import { Mic, MicOff, Volume2, VolumeX, Loader2 } from 'lucide-react'
import { motion } from 'framer-motion'

interface VoiceAssistantProps {
  mode: string
  apiKey: string
}

export default function VoiceAssistant({ mode, apiKey }: VoiceAssistantProps) {
  const [isListening, setIsListening] = useState(false)
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [response, setResponse] = useState('')
  const [error, setError] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const [volume, setVolume] = useState(0)

  const recognitionRef = useRef<any>(null)
  const synthRef = useRef<SpeechSynthesis | null>(null)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const animationFrameRef = useRef<number>()

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
      if (SpeechRecognition) {
        recognitionRef.current = new SpeechRecognition()
        recognitionRef.current.continuous = false
        recognitionRef.current.interimResults = true
        recognitionRef.current.lang = 'en-US'

        recognitionRef.current.onresult = (event: any) => {
          const current = event.resultIndex
          const transcriptText = event.results[current][0].transcript
          setTranscript(transcriptText)

          if (event.results[current].isFinal) {
            handleUserInput(transcriptText)
          }
        }

        recognitionRef.current.onerror = (event: any) => {
          setError(`Speech recognition error: ${event.error}`)
          setIsListening(false)
        }

        recognitionRef.current.onend = () => {
          setIsListening(false)
        }
      }

      synthRef.current = window.speechSynthesis
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
      if (synthRef.current) {
        synthRef.current.cancel()
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current)
      }
    }
  }, [])

  const setupAudioVisualization = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true })
      audioContextRef.current = new AudioContext()
      analyserRef.current = audioContextRef.current.createAnalyser()
      const source = audioContextRef.current.createMediaStreamSource(stream)
      source.connect(analyserRef.current)
      analyserRef.current.fftSize = 256
      visualize()
    } catch (err) {
      console.error('Audio visualization setup error:', err)
    }
  }

  const visualize = () => {
    if (!analyserRef.current) return

    const dataArray = new Uint8Array(analyserRef.current.frequencyBinCount)
    const animate = () => {
      analyserRef.current!.getByteFrequencyData(dataArray)
      const average = dataArray.reduce((a, b) => a + b) / dataArray.length
      setVolume(average / 255)
      animationFrameRef.current = requestAnimationFrame(animate)
    }
    animate()
  }

  const toggleListening = () => {
    if (!recognitionRef.current) {
      setError('Speech recognition not supported in this browser')
      return
    }

    if (isListening) {
      recognitionRef.current.stop()
      setIsListening(false)
    } else {
      setTranscript('')
      setError('')
      recognitionRef.current.start()
      setIsListening(true)
      setupAudioVisualization()
    }
  }

  const handleUserInput = async (text: string) => {
    if (!apiKey) {
      setError('Please set your Gemini API key in settings')
      return
    }

    setIsProcessing(true)
    setError('')

    try {
      const modeInstructions = getModeInstructions(mode)

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: text,
          mode: mode,
          systemPrompt: modeInstructions,
          apiKey: apiKey,
        }),
      })

      const data = await res.json()

      if (data.error) {
        setError(data.error)
      } else {
        setResponse(data.response)
        speak(data.response)
      }
    } catch (err) {
      setError('Failed to get response from AI')
      console.error(err)
    } finally {
      setIsProcessing(false)
    }
  }

  const getModeInstructions = (mode: string): string => {
    const instructions: Record<string, string> = {
      general: 'You are a helpful voice assistant. Provide clear, concise responses.',
      creative: 'You are a creative assistant. Think outside the box and provide imaginative, innovative ideas.',
      technical: 'You are a technical expert. Provide detailed, accurate technical information and solutions.',
      wellness: 'You are a wellness coach. Provide supportive, health-focused guidance and motivation.',
      productivity: 'You are a productivity assistant. Help users organize, plan, and optimize their tasks efficiently.',
      learning: 'You are a learning tutor. Explain concepts clearly and help users understand complex topics.',
    }
    return instructions[mode] || instructions.general
  }

  const speak = (text: string) => {
    if (!synthRef.current) return

    synthRef.current.cancel()
    const utterance = new SpeechSynthesisUtterance(text)
    utterance.rate = 1.0
    utterance.pitch = 1.0
    utterance.volume = 1.0

    utterance.onstart = () => setIsSpeaking(true)
    utterance.onend = () => setIsSpeaking(false)
    utterance.onerror = () => setIsSpeaking(false)

    synthRef.current.speak(utterance)
  }

  const stopSpeaking = () => {
    if (synthRef.current) {
      synthRef.current.cancel()
      setIsSpeaking(false)
    }
  }

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 relative overflow-y-auto">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute bg-primary-500/10 rounded-full"
            style={{
              width: Math.random() * 100 + 50,
              height: Math.random() * 100 + 50,
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
            }}
            animate={{
              scale: [1, 1.5, 1],
              opacity: [0.3, 0.6, 0.3],
            }}
            transition={{
              duration: Math.random() * 3 + 2,
              repeat: Infinity,
              ease: 'easeInOut',
            }}
          />
        ))}
      </div>

      {/* Main Voice Interface */}
      <div className="relative z-10 flex flex-col items-center gap-6 max-w-md w-full">
        {/* Voice Visualizer */}
        <motion.div
          className="relative"
          animate={{
            scale: isListening ? [1, 1.1, 1] : 1,
          }}
          transition={{
            duration: 1.5,
            repeat: isListening ? Infinity : 0,
          }}
        >
          {/* Outer rings */}
          {isListening && (
            <>
              <div className="absolute inset-0 rounded-full bg-primary-500/20 animate-ping" style={{ animationDuration: '2s' }} />
              <div className="absolute inset-0 rounded-full bg-primary-500/30 pulse-ring" />
            </>
          )}

          {/* Main button */}
          <button
            onClick={toggleListening}
            disabled={isProcessing}
            className={`relative w-32 h-32 rounded-full flex items-center justify-center transition-all duration-300 ${
              isListening
                ? 'bg-gradient-to-br from-red-500 to-red-700 glow-strong'
                : isProcessing
                ? 'bg-gradient-to-br from-yellow-500 to-yellow-700'
                : 'bg-gradient-to-br from-primary-500 to-primary-700 glow'
            } hover:scale-105 active:scale-95 shadow-2xl`}
            style={{
              transform: isListening ? `scale(${1 + volume * 0.3})` : undefined,
            }}
          >
            {isProcessing ? (
              <Loader2 className="w-12 h-12 text-white animate-spin" />
            ) : isListening ? (
              <MicOff className="w-12 h-12 text-white" />
            ) : (
              <Mic className="w-12 h-12 text-white" />
            )}
          </button>

          {/* Volume bars */}
          {isListening && (
            <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 flex gap-1">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="w-1 bg-primary-400 rounded-full transition-all duration-100"
                  style={{
                    height: `${Math.max(4, volume * 24 * (1 + Math.sin(Date.now() / 100 + i) * 0.5))}px`,
                  }}
                />
              ))}
            </div>
          )}
        </motion.div>

        {/* Status Text */}
        <div className="text-center">
          <p className="text-white text-lg font-medium text-shadow">
            {isProcessing
              ? 'Processing...'
              : isListening
              ? 'Listening...'
              : 'Tap to speak'}
          </p>
          <p className="text-primary-300 text-sm mt-1">Mode: {mode}</p>
        </div>

        {/* Transcript */}
        {transcript && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-2xl p-4 w-full"
          >
            <p className="text-white/70 text-sm mb-1">You said:</p>
            <p className="text-white">{transcript}</p>
          </motion.div>
        )}

        {/* Response */}
        {response && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-dark rounded-2xl p-4 w-full"
          >
            <div className="flex items-center justify-between mb-2">
              <p className="text-white/70 text-sm">AI Response:</p>
              <button
                onClick={stopSpeaking}
                className="text-white/70 hover:text-white transition-colors"
              >
                {isSpeaking ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              </button>
            </div>
            <p className="text-white">{response}</p>
          </motion.div>
        )}

        {/* Error */}
        {error && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-red-500/20 border border-red-500/50 rounded-2xl p-4 w-full"
          >
            <p className="text-red-200 text-sm">{error}</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
