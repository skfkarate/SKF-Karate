import React from 'react'
import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer'

const styles = StyleSheet.create({
  page: { backgroundColor: '#ffffff', padding: 40, fontFamily: 'Helvetica' },
  headerBand: { backgroundColor: '#05080f', padding: 20, marginBottom: 30, borderRadius: 4 },
  headerTitle: { color: '#f39c12', fontSize: 20, fontWeight: 'bold' },
  headerSubtitle: { color: '#ffffff', fontSize: 11, marginTop: 4 },
  receiptNumber: { color: '#c0392b', fontSize: 10, marginTop: 4 },
  sectionTitle: { fontSize: 11, fontWeight: 'bold', color: '#333', marginBottom: 8, marginTop: 16 },
  row: { flexDirection: 'row', marginBottom: 6 },
  label: { width: 160, fontSize: 10, color: '#666' },
  value: { fontSize: 10, color: '#111', fontWeight: 'bold' },
  divider: { borderBottom: '1px solid #eee', marginVertical: 12 },
  paidStamp: { 
    border: '3px solid #27ae60', borderRadius: 4, padding: '8 16', 
    color: '#27ae60', fontSize: 18, fontWeight: 'bold', 
    transform: 'rotate(-15deg)', position: 'absolute', top: 200, right: 60 
  },
  footer: { marginTop: 40, fontSize: 8, color: '#999', textAlign: 'center' }
})

interface ReceiptProps {
  receiptId: string
  studentName: string
  skfId: string
  branch: string
  month: string
  year: number
  amount: number
  paidDate: string
  paymentMethod: string
  dojoAddress: string
}

export function ReceiptDocument(props: ReceiptProps) {
  return (
    <Document>
      <Page size="A4" style={styles.page}>
        <View style={styles.headerBand}>
          <Text style={styles.headerTitle}>SKF Karate</Text>
          <Text style={styles.headerSubtitle}>Official Fee Receipt</Text>
          <Text style={styles.receiptNumber}>Receipt: {props.receiptId}</Text>
        </View>
        
        <Text style={styles.sectionTitle}>Student Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Student Name</Text>
          <Text style={styles.value}>{props.studentName}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>SKF ID</Text>
          <Text style={styles.value}>{props.skfId}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Branch</Text>
          <Text style={styles.value}>{props.branch}</Text>
        </View>
        
        <View style={styles.divider} />
        <Text style={styles.sectionTitle}>Payment Details</Text>
        <View style={styles.row}>
          <Text style={styles.label}>Period</Text>
          <Text style={styles.value}>{props.month} {props.year}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Amount</Text>
          <Text style={styles.value}>₹{Number(props.amount).toLocaleString('en-IN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Date of Payment</Text>
          <Text style={styles.value}>{new Date(props.paidDate).toLocaleDateString('en-IN')}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Payment Method</Text>
          <Text style={styles.value}>{props.paymentMethod}</Text>
        </View>
        
        <Text style={styles.paidStamp}>PAID ✓</Text>
        
        <View style={styles.divider} />
        <Text style={styles.footer}>
          {props.dojoAddress} | This is a computer-generated receipt and does not require a signature.
        </Text>
      </Page>
    </Document>
  )
}
