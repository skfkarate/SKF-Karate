'use client'

import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import type { FeeRow, Student } from '@/types'
import { FaFileDownload, FaCheckCircle, FaExclamationCircle } from 'react-icons/fa'

export default function FeesClient({ initialFees, student }: { initialFees: FeeRow[], student: Student }) {
  const [payingMonth, setPayingMonth] = useState<{ month: string, year: number } | null>(null)
  const [successMessage, setSuccessMessage] = useState<string | null>(null)

  const { data: fees = initialFees, refetch } = useQuery<FeeRow[]>({
    queryKey: ['fees', student.skfId],
    queryFn: async () => {
      const res = await fetch('/api/portal/fees')
      if (!res.ok) throw new Error('Failed to fetch fees')
      const json = await res.json()
      return json.fees || []
    },
    initialData: initialFees
  })

  // Basic identification of current month/year
  const currentMonthName = new Date().toLocaleString('en-US', { month: 'long' })
  const currentYear = new Date().getFullYear()

  const currentFee = fees.find(f => f.month === currentMonthName && f.year === currentYear)
  const overdueFees = fees.filter(f => f.status === 'overdue')
  
  const isOverdue = overdueFees.length > 0
  const isPaid = currentFee?.status === 'paid'

  const totalOwed = (currentFee?.status !== 'paid' ? currentFee?.amount || student.monthlyFee : 0) 
                  + overdueFees.reduce((acc, f) => acc + f.amount, 0)

  // Razorpay Injection
  const loadRazorpayScript = () => {
    return new Promise((resolve) => {
      if ((window as any).Razorpay) return resolve(true)
      const script = document.createElement('script')
      script.src = 'https://checkout.razorpay.com/v1/checkout.js'
      script.onload = () => resolve(true)
      script.onerror = () => resolve(false)
      document.body.appendChild(script)
    })
  }

  const handlePayment = async (month: string, year: number, amount: number) => {
    setPayingMonth({ month, year })
    setSuccessMessage(null)

    try {
      const isLoaded = await loadRazorpayScript()
      if (!isLoaded) throw new Error('Razorpay SDK failed to load')

      // 1. Create Order
      const orderRes = await fetch('/api/portal/fees/pay', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ month, year })
      })
      const orderData = await orderRes.json()
      
      if (!orderRes.ok) throw new Error(orderData.error || 'Failed to create order')

      // 2. Open Checkout
      const options = {
        key: orderData.key,
        amount: orderData.amount * 100,
        currency: 'INR',
        name: 'SKF Karate',
        description: `Fee for ${month} ${year}`,
        order_id: orderData.orderId,
        handler: function (response: any) {
          // Success! Webhook handles DB update.
          setSuccessMessage(`Payment for ${month} ${year} was successful. Generating receipt...`)
          setTimeout(() => {
            refetch()
            setSuccessMessage(null)
          }, 4000)
        },
        prefill: {
          name: student.name,
          contact: student.phone
        },
        theme: {
          color: '#c0392b'
        },
        modal: {
          ondismiss: function() {
            setPayingMonth(null)
          }
        }
      }

      const rzp = new (window as any).Razorpay(options)
      rzp.on('payment.failed', function (response: any) {
        console.error(response.error.description)
        setPayingMonth(null)
      })
      rzp.open()

    } catch (err) {
      console.error(err)
      alert("Payment initialization failed. Please try again.")
      setPayingMonth(null)
    }
  }

  return (
    <div>
      {/* SECTION 1: CURRENT STATUS */}
      <section className={`fees-status-card ${isOverdue ? 'due' : isPaid ? 'paid' : ''}`}>
        <h2 style={{ fontSize: '1rem', textTransform: 'uppercase', letterSpacing: '0.1em', color: 'rgba(255,255,255,0.6)' }}>
          {currentMonthName} {currentYear}
        </h2>
        
        {isOverdue || (currentFee && currentFee.status !== 'paid') ? (
          <>
            <div className={`fees-status-amount due`}>
              ₹{totalOwed.toLocaleString()} {isOverdue && <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', textShadow: 'none' }}>TOTAL DUE</span>}
              {!isOverdue && <span style={{ fontSize: '1.2rem', verticalAlign: 'middle', textShadow: 'none' }}>DUE</span>}
            </div>
            {isOverdue && <p style={{ color: '#ff4444', marginBottom: '1.5rem', fontWeight: 600 }}>(Includes {overdueFees.length} month(s) overdue)</p>}
            
            <button 
              className="fees-action-btn"
              onClick={() => handlePayment(currentFee?.month || currentMonthName, currentFee?.year || currentYear, totalOwed)}
              disabled={payingMonth !== null}
            >
              {payingMonth ? 'Processing...' : 'Pay Now'}
            </button>
          </>
        ) : (
          <>
            <div className={`fees-status-amount paid`}>
              PAID <FaCheckCircle style={{ fontSize: '2.5rem', verticalAlign: 'middle' }} />
            </div>
            <p style={{ color: 'rgba(255,255,255,0.5)' }}>All caught up for this month!</p>
          </>
        )}

        {successMessage && (
          <div style={{ marginTop: '1.5rem', padding: '1rem', background: 'rgba(46, 213, 115, 0.1)', border: '1px solid #2ed573', borderRadius: '12px', color: '#2ed573', fontWeight: 600 }}>
            {successMessage}
          </div>
        )}
      </section>

      {/* SECTION 2: PAYMENT HISTORY */}
      <section>
        <h2 style={{ fontSize: '1.2rem', color: 'var(--gold, #ffb703)', marginBottom: '0.5rem', textTransform: 'uppercase' }}>Payment History & Receipts</h2>
        
        {fees.length === 0 ? (
          <div style={{ padding: '3rem', textAlign: 'center', background: 'rgba(255,255,255,0.02)', borderRadius: '16px' }}>
            No fee history available on this account.
          </div>
        ) : (
          <table className="fee-history-table">
            <thead>
              <tr>
                <th>Month</th>
                <th>Amount</th>
                <th>Status</th>
                <th>Date Paid</th>
                <th>Receipt</th>
              </tr>
            </thead>
            <tbody>
              {fees.sort((a,b) => {
                // Approximate sort by recency
                return new Date(`${b.month} 1, ${b.year}`).getTime() - new Date(`${a.month} 1, ${a.year}`).getTime()
              }).map((row, i) => (
                <tr key={`${row.month}-${row.year}-${i}`}>
                  <td data-label="Month"><strong style={{ color: '#fff' }}>{row.month} {row.year}</strong></td>
                  <td data-label="Amount">₹{row.amount.toLocaleString()}</td>
                  <td data-label="Status">
                    {row.status === 'paid' ? <span className="badge-paid">Paid</span> : <span className="badge-due">{row.status}</span>}
                  </td>
                  <td data-label="Date Paid">
                    {row.status === 'paid' ? new Date(row.paidDate!).toLocaleDateString() : '—'}
                  </td>
                  <td data-label="Receipt">
                    {row.status === 'paid' ? (
                      <a href={`/api/portal/receipts/${row.receiptId || `RCP_${row.skfId}_${row.month}_${row.year}`}`} download
                         style={{ textDecoration: 'none', background: 'rgba(255,255,255,0.1)', border: 'none', color: '#fff', padding: '0.4rem 0.8rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '0.5rem' }}>
                        <FaFileDownload /> PDF
                      </a>
                    ) : (
                      <button 
                        onClick={() => handlePayment(row.month, row.year, row.amount)}
                        style={{ background: 'var(--crimson)', border: 'none', color: '#fff', padding: '0.4rem 1.2rem', borderRadius: '50px', cursor: 'pointer', fontSize: '0.8rem', fontWeight: 700, textTransform: 'uppercase' }}
                        disabled={payingMonth?.month === row.month}
                      >
                        {payingMonth?.month === row.month ? '...' : 'Pay'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  )
}
