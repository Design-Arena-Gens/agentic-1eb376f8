import { NextRequest, NextResponse } from 'next/server'
import { GoogleGenerativeAI } from '@google/generative-ai'

export async function POST(request: NextRequest) {
  try {
    const { message, mode, systemPrompt, apiKey } = await request.json()

    if (!apiKey) {
      return NextResponse.json(
        { error: 'API key is required' },
        { status: 400 }
      )
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Message is required' },
        { status: 400 }
      )
    }

    const genAI = new GoogleGenerativeAI(apiKey)
    const model = genAI.getGenerativeModel({
      model: 'gemini-2.0-flash-exp',
      systemInstruction: systemPrompt || 'You are a helpful voice assistant. Provide clear, concise responses suitable for voice output.'
    })

    const result = await model.generateContent(message)
    const response = result.response
    const text = response.text()

    return NextResponse.json({ response: text })
  } catch (error: any) {
    console.error('Chat API error:', error)

    return NextResponse.json(
      { error: error.message || 'Failed to generate response' },
      { status: 500 }
    )
  }
}
