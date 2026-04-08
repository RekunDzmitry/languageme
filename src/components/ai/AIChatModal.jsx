import { useState, useEffect, useRef } from 'react'
import { useT } from '../../i18n'
import { aiApi } from '../../api/client'

export default function AIChatModal({ exerciseKey, exerciseType, verb, prompt, answer, onClose, onNoteSaved }) {
  const { t } = useT()
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [isSaving, setIsSaving] = useState(false)
  const messagesEndRef = useRef(null)
  const inputRef = useRef(null)

  // Load existing conversation
  useEffect(() => {
    async function loadConversation() {
      try {
        const data = await aiApi.getConversation(exerciseKey)
        if (data.messages && data.messages.length > 0) {
          setMessages(data.messages.map(m => ({
            id: m.id,
            role: m.role,
            content: m.content
          })))
        }
      } catch (err) {
        console.log('No existing conversation or error:', err.message)
      }
    }
    loadConversation()
  }, [exerciseKey])

  // Auto-scroll to bottom
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // Focus input
  useEffect(() => {
    inputRef.current?.focus()
  }, [])

  async function handleSend() {
    if (!input.trim() || isLoading) return

    const userMessage = input.trim()
    setInput('')
    setIsLoading(true)
    setError(null)

    // Add user message immediately
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'user',
      content: userMessage
    }])

    try {
      // Build exercise context for the AI
      const exerciseContext = {
        verb: verb ? {
          infinitive: verb.infinitive,
          meaning: verb.ru,
          group: verb.group
        } : null,
        prompt: prompt || null,  // The Russian prompt shown to user
        answer: answer || null,  // The correct French answer
      }

      const response = await aiApi.chat(userMessage, exerciseKey, exerciseType, exerciseContext)
      setMessages(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.message
      }])
    } catch (err) {
      setError(err.message || t('ai_error'))
      // Remove the user message we just added if API failed
      setMessages(prev => prev.slice(0, -1))
    } finally {
      setIsLoading(false)
    }
  }

  async function handleSaveAsNote() {
    if (messages.length < 2 || isSaving) return

    setIsSaving(true)
    try {
      // Create structured note from conversation
      const summary = messages[messages.length - 1]?.content?.slice(0, 200) || ''
      const noteContent = {
        exerciseKey,
        exerciseType,
        verb: verb?.infinitive || exerciseKey,
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        summary
      }

      await aiApi.saveNote(
        exerciseKey,
        JSON.stringify(noteContent),
        `${t('note_for')} ${verb?.infinitive || exerciseKey}`
      )
      // Notify parent to refresh notes
      if (onNoteSaved) {
        onNoteSaved()
      }
      onClose()
    } catch (err) {
      setError(t('ai_save_error'))
    } finally {
      setIsSaving(false)
    }
  }

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div className="bg-surface border border-border rounded-2xl w-full max-w-lg max-h-[85vh] flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-full bg-gradient-to-br from-accent to-purple-500 flex items-center justify-center">
              <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
              </svg>
            </div>
            <div>
              <h3 className="font-bold text-white">{t('ai_helper')}</h3>
              {verb && (
                <p className="text-xs text-text-muted">{t('about_word')}: {verb.infinitive}</p>
              )}
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-text-muted hover:text-white transition-colors"
          >
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {messages.length === 0 && !isLoading && (
            <div className="text-center text-text-muted py-8">
              <p className="mb-2">{t('ai_welcome')}</p>
              <p className="text-sm opacity-70">
                {t('ai_example_question').replace('{verb}', verb?.infinitive || 'parler')}
              </p>
            </div>
          )}

          {messages.map(msg => (
            <div
              key={msg.id}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-br-md'
                    : 'bg-white/10 text-white/90 rounded-bl-md'
                }`}
              >
                <p className="whitespace-pre-wrap text-sm leading-relaxed">{msg.content}</p>
              </div>
            </div>
          ))}

          {isLoading && (
            <div className="flex justify-start">
              <div className="bg-white/10 rounded-2xl rounded-bl-md px-4 py-3">
                <div className="flex gap-1">
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                  <span className="w-2 h-2 bg-white/50 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                </div>
              </div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 text-sm py-2">
              {error}
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Actions */}
        {messages.length >= 2 && (
          <div className="px-4 py-2 border-t border-border">
            <button
              onClick={handleSaveAsNote}
              disabled={isSaving}
              className="w-full py-2 text-sm font-medium text-accent bg-accent/10 hover:bg-accent/20 border border-accent/30 rounded-lg transition-colors disabled:opacity-50"
            >
              {isSaving ? t('ai_saving') : t('ai_save_as_note')}
            </button>
          </div>
        )}

        {/* Input */}
        <div className="p-4 border-t border-border">
          <div className="flex gap-2">
            <textarea
              ref={inputRef}
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder={t('ai_placeholder')}
              rows={1}
              className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-2.5 text-sm text-white placeholder-white/30 resize-none focus:outline-none focus:border-accent/50"
            />
            <button
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="px-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
