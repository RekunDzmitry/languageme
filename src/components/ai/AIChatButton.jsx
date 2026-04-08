import { useState } from 'react'
import { useT } from '../../i18n'
import AIChatModal from './AIChatModal'

export default function AIChatButton({ exerciseKey, exerciseType = 'conjugation', verb = null, prompt = null, answer = null, onNoteSaved = null }) {
  const { t } = useT()
  const [isOpen, setIsOpen] = useState(false)

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-accent bg-accent/10 border border-accent/30 rounded-lg hover:bg-accent/20 transition-colors"
        title={t('ask_ai_helper')}
      >
        <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
        </svg>
        <span>AI</span>
      </button>

      {isOpen && (
        <AIChatModal
          exerciseKey={exerciseKey}
          exerciseType={exerciseType}
          verb={verb}
          prompt={prompt}
          answer={answer}
          onClose={() => setIsOpen(false)}
          onNoteSaved={onNoteSaved}
        />
      )}
    </>
  )
}
