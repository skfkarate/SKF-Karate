'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import type { Student } from '@/types'
import { FaUserFriends, FaCheckCircle } from 'react-icons/fa'

export function ChildSwitcher({ 
  students, 
  activeSkfId 
}: { 
  students: Student[], 
  activeSkfId: string 
}) {
  const router = useRouter()
  const [isOpen, setIsOpen] = useState(false)

  if (students.length <= 1) return null

  const handleSelect = (skfId: string) => {
    // Setting cookie on the document
    document.cookie = `skf_portal_child_selection=${skfId}; path=/; max-age=2592000`
    setIsOpen(false)
    router.refresh()
  }

  const activeStudent = students.find(s => s.skfId === activeSkfId) || students[0]

  return (
    <div className="child-switcher" style={{ position: 'relative', marginBottom: '2rem' }}>
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="child-switcher-btn"
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div className="child-switcher-icon"><FaUserFriends /></div>
          <div style={{ textAlign: 'left' }}>
            <span style={{ display: 'block', fontSize: '0.75rem', color: 'rgba(255,255,255,0.6)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Viewing Profile For</span>
            <strong style={{ display: 'block', color: 'var(--gold, #ffb703)' }}>{activeStudent.name}</strong>
          </div>
        </div>
        <span style={{ fontSize: '0.8rem', opacity: 0.5 }}>▼</span>
      </button>

      {isOpen && (
        <div className="child-switcher-dropdown">
          {students.map(student => (
            <button 
              key={student.skfId} 
              className={`child-switcher-item ${student.skfId === activeSkfId ? 'child-switcher-item--active' : ''}`}
              onClick={() => handleSelect(student.skfId)}
            >
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                <span>{student.name}</span>
                <span style={{ fontSize: '0.75rem', opacity: 0.6 }}>{student.skfId} • {student.belt} Belt</span>
              </div>
              {student.skfId === activeSkfId && <FaCheckCircle color="var(--gold)" />}
            </button>
          ))}
        </div>
      )}
    </div>
  )
}
