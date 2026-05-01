'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, ChevronDown } from 'lucide-react'
import SectionReveal from './SectionReveal'
import { FAQ_SECTION } from '@/data/constants/homeContent'

function FAQItem({ item, index }: { item: { question: string; answer: string }; index: number }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <motion.div
      className={`home-faq__item ${isOpen ? 'home-faq__item--open' : ''}`}
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, amount: 0.3 }}
      transition={{ duration: 0.5, delay: index * 0.08 }}
    >
      <button
        className="home-faq__question"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-controls={`faq-answer-${index}`}
      >
        <span className="home-faq__question-number">
          {String(index + 1).padStart(2, '0')}
        </span>
        <span className="home-faq__question-text">{item.question}</span>
        <motion.div
          className="home-faq__chevron"
          animate={{ rotate: isOpen ? 180 : 0 }}
          transition={{ duration: 0.3 }}
        >
          <ChevronDown size={20} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={`faq-answer-${index}`}
            className="home-faq__answer"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
            <p className="home-faq__answer-text">{item.answer}</p>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

export default function HomeFAQ() {
  return (
    <section className="home-faq section section--tint-dark" id="faq">
      <div className="container">
        <SectionReveal className="home-faq__header">
          <SectionReveal.Item>
            <span className="section-label">
              <HelpCircle size={14} /> {FAQ_SECTION.LABEL}
            </span>
          </SectionReveal.Item>
          <SectionReveal.Item>
            <h2 className="section-title">
              {FAQ_SECTION.TITLE_1}{' '}
              <span className="text-gradient">{FAQ_SECTION.TITLE_ACCENT}</span>
            </h2>
          </SectionReveal.Item>
        </SectionReveal>

        <div className="home-faq__list">
          {FAQ_SECTION.ITEMS.map((item, i) => (
            <FAQItem key={i} item={item} index={i} />
          ))}
        </div>
      </div>
    </section>
  )
}
