import React from 'react'
import { Document, Page, Text, View, StyleSheet, Image, Font } from '@react-pdf/renderer'
import path from 'path'

const fontRegularPath = path.join(process.cwd(), 'public/fonts/Montserrat-Regular.ttf')
const fontBoldPath = path.join(process.cwd(), 'public/fonts/Montserrat-Bold.ttf')

Font.register({
  family: 'Montserrat',
  fonts: [
    { src: fontRegularPath, fontWeight: 'normal' },
    { src: fontBoldPath, fontWeight: 'bold' }
  ]
})

interface ReceiptProps {
  receiptId: string
  studentName: string
  skfId: string
  branch: string
  feeType: string
  month: string
  year: number
  amount: number
  paidDate: string
  paymentMethod: string
  dojoAddress: string
  verifiedBy?: string
  verifiedAt?: string
  issuedAt: string
  themeId?: 'skf_classic' | 'skf_minimal' | 'skf_iconic'
}

const formatInr = (amount: number) => `INR ${Number(amount || 0).toLocaleString('en-IN')}`

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })
}

const logoPath = path.join(process.cwd(), 'public/logo/SKF logo.png')

const s = StyleSheet.create({
  page: {
    backgroundColor: '#ffffff',
    padding: 24,
    fontFamily: 'Montserrat',
    color: '#1a1a1a',
  },

  /* Accent bar */
  bar: { height: 2.5, backgroundColor: '#D62828', marginBottom: 10 },
  barGold: { height: 2.5, backgroundColor: '#FFB703', marginTop: 10 },

  /* Header row */
  hdr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingBottom: 8, borderBottomWidth: 0.75, borderBottomColor: '#e0e0e0', marginBottom: 8 },
  hdrLeft: { flexDirection: 'row', alignItems: 'center' },
  logo: { width: 24, height: 24, marginRight: 6 },
  org: { fontSize: 9, fontWeight: 'bold', color: '#1a1a1a' },
  orgSub: { fontSize: 4.5, color: '#999', marginTop: 1 },
  title: { fontSize: 10, fontWeight: 'bold', color: '#D62828' },

  /* Meta row */
  meta: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 8, paddingBottom: 6, borderBottomWidth: 0.5, borderBottomColor: '#f0f0f0' },
  mL: { fontSize: 5, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 1 },
  mV: { fontSize: 7, color: '#1a1a1a', fontWeight: 'bold' },

  /* Section label */
  sec: { fontSize: 6, fontWeight: 'bold', color: '#D62828', textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 5, marginTop: 4 },

  /* Data grid */
  row: { flexDirection: 'row', marginBottom: 4 },
  half: { width: '50%' },
  lbl: { fontSize: 5, color: '#aaa', marginBottom: 1 },
  val: { fontSize: 8, color: '#1a1a1a', fontWeight: 'bold' },

  /* Separator */
  sep: { height: 0.5, backgroundColor: '#f0f0f0', marginVertical: 6 },

  /* Payment line */
  line: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 4 },
  lineL: { fontSize: 7.5, color: '#333' },
  lineR: { fontSize: 7.5, color: '#888' },

  /* Total */
  tot: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 6, borderTopWidth: 0.75, borderTopColor: '#e0e0e0', marginTop: 4 },
  totL: { fontSize: 7, color: '#D62828', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 0.4 },
  totV: { fontSize: 12, color: '#1a1a1a', fontWeight: 'bold' },

  /* Footer */
  ftr: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', paddingTop: 8, borderTopWidth: 0.5, borderTopColor: '#e0e0e0', marginTop: 8 },
  ftrL: { fontSize: 5, color: '#aaa', textTransform: 'uppercase', letterSpacing: 0.4, marginBottom: 1 },
  ftrV: { fontSize: 6, color: '#888', lineHeight: 1.4 },

  /* Stamp */
  stamp: { width: 40, height: 40, borderWidth: 1.5, borderColor: '#D62828', borderRadius: 20, alignItems: 'center', justifyContent: 'center', transform: 'rotate(-6deg)' },
  stTxt: { fontSize: 6, fontWeight: 'bold', color: '#D62828', letterSpacing: 1 },
  stSub: { fontSize: 3.5, color: '#D62828', marginTop: 1 },
})

export function ReceiptDocument(props: ReceiptProps) {
  const feePeriod = `${props.month} ${props.year}`

  return (
    <Document title={`${props.receiptId} Fee Receipt`} author="SKF Karate">
      <Page size={[400, 260]} style={s.page} wrap={false}>

        {/* Top red bar */}
        <View style={s.bar} />

        {/* Header */}
        <View style={s.hdr}>
          <View style={s.hdrLeft}>
            {/* eslint-disable-next-line jsx-a11y/alt-text -- @react-pdf/renderer Image has no alt prop. */}
            <Image src={logoPath} style={s.logo} />
            <View>
              <Text style={s.org}>SKF Karate</Text>
              <Text style={s.orgSub}>Sports Karate-do Fitness & Self Defence Association</Text>
            </View>
          </View>
          <Text style={s.title}>FEE RECEIPT</Text>
        </View>

        {/* Receipt No + Date */}
        <View style={s.meta}>
          <View>
            <Text style={s.mL}>Receipt No.</Text>
            <Text style={s.mV}>{props.receiptId}</Text>
          </View>
          <View style={{ alignItems: 'flex-end' }}>
            <Text style={s.mL}>Date</Text>
            <Text style={s.mV}>{formatDate(props.paidDate)}</Text>
          </View>
        </View>

        {/* Student Details */}
        <Text style={s.sec}>Student</Text>
        <View style={s.row}>
          <View style={s.half}>
            <Text style={s.lbl}>Name</Text>
            <Text style={s.val}>{props.studentName}</Text>
          </View>
          <View style={s.half}>
            <Text style={s.lbl}>SKF ID</Text>
            <Text style={s.val}>{props.skfId}</Text>
          </View>
        </View>
        <View style={s.row}>
          <View style={s.half}>
            <Text style={s.lbl}>Branch</Text>
            <Text style={s.val}>{props.branch}</Text>
          </View>
          <View style={s.half}>
            <Text style={s.lbl}>Issued At</Text>
            <Text style={s.val}>{formatDate(props.issuedAt)}</Text>
          </View>
        </View>

        <View style={s.sep} />

        {/* Payment */}
        <Text style={s.sec}>Payment</Text>
        <View style={s.line}>
          <Text style={s.lineL}>{props.feeType}</Text>
          <Text style={s.lineR}>{feePeriod}</Text>
        </View>

        {/* Total */}
        <View style={s.tot}>
          <Text style={s.totL}>Total Received</Text>
          <Text style={s.totV}>{formatInr(props.amount)}</Text>
        </View>

        <View style={s.sep} />

        {/* Footer */}
        <View style={s.ftr}>
          <View>
            <Text style={s.ftrL}>Dojo</Text>
            <Text style={s.ftrV}>{props.dojoAddress}</Text>
          </View>
          <View style={s.stamp}>
            <Text style={s.stTxt}>PAID</Text>
            <Text style={s.stSub}>SKF KARATE</Text>
          </View>
        </View>

        {/* Bottom gold bar */}
        <View style={s.barGold} />

      </Page>
    </Document>
  )
}
