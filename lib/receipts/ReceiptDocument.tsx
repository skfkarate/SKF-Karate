import React, { ReactNode } from 'react'
import { Document, Font, Image, Page, StyleSheet, Text, View } from '@react-pdf/renderer'
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

const colors = {
  canvas: "#eef2f5",
  dark: "#0f1419",
  ink: "#111827",
  muted: "#667085",
  line: "#d8dee8",
  gold: "#ffb703",
  crimson: "#d62828",
  green: "#12805c",
  paper: "#ffffff",
  soft: "#f8fafc",
  warm: "#fff7e1",
};

const styles = StyleSheet.create({
  page: {
    backgroundColor: colors.canvas,
    color: colors.ink,
    fontFamily: "Montserrat",
    fontSize: 9,
    padding: 24,
  },
  receipt: {
    backgroundColor: colors.paper,
    borderColor: colors.dark,
    borderRadius: 8,
    borderStyle: "solid",
    borderWidth: 1.2,
    flexDirection: "column",
    minHeight: "100%",
    overflow: "hidden",
  },
  topBand: {
    alignItems: "center",
    backgroundColor: colors.dark,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingBottom: 14,
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 16,
  },
  brandBlock: {
    alignItems: "center",
    flexDirection: "row",
    width: "68%",
  },
  logo: {
    backgroundColor: colors.paper,
    borderColor: colors.gold,
    borderRadius: 25,
    borderStyle: "solid",
    borderWidth: 1.4,
    height: 50,
    marginRight: 10,
    objectFit: "contain",
    width: 50,
  },
  brand: {
    color: colors.paper,
    fontSize: 19,
    fontWeight: "bold",
    letterSpacing: 3,
    lineHeight: 1,
  },
  association: {
    color: colors.gold,
    fontSize: 6.8,
    fontWeight: "bold",
    letterSpacing: 0.5,
    lineHeight: 1.35,
    marginTop: 3,
    textTransform: "uppercase",
    width: 270,
  },
  receiptHead: {
    alignItems: "flex-end",
    width: "32%",
  },
  documentTitle: {
    color: colors.paper,
    fontSize: 13,
    fontWeight: "bold",
    letterSpacing: 1.3,
    textAlign: "right",
    textTransform: "uppercase",
  },
  receiptPill: {
    borderColor: colors.gold,
    borderRadius: 4,
    borderStyle: "solid",
    borderWidth: 0.8,
    color: colors.gold,
    fontSize: 6.8,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginTop: 6,
    paddingBottom: 3,
    paddingLeft: 6,
    paddingRight: 6,
    paddingTop: 3,
    textAlign: "right",
  },
  accentRail: {
    flexDirection: "row",
    height: 4,
  },
  accentRed: {
    backgroundColor: colors.crimson,
    flexGrow: 2,
  },
  accentGold: {
    backgroundColor: colors.gold,
    flexGrow: 1,
  },
  body: {
    flexGrow: 1,
    paddingBottom: 14,
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 16,
  },
  summary: {
    backgroundColor: colors.soft,
    borderColor: colors.line,
    borderRadius: 7,
    borderStyle: "solid",
    borderWidth: 1,
    flexDirection: "row",
    marginBottom: 12,
    overflow: "hidden",
  },
  summaryAccent: {
    backgroundColor: colors.crimson,
    width: 5,
  },
  summaryLeft: {
    borderRightColor: colors.line,
    borderRightStyle: "solid",
    borderRightWidth: 1,
    paddingBottom: 11,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 11,
    width: "58%",
  },
  summaryRight: {
    alignItems: "flex-end",
    justifyContent: "center",
    paddingBottom: 11,
    paddingLeft: 12,
    paddingRight: 12,
    paddingTop: 11,
    width: "42%",
  },
  kicker: {
    color: colors.muted,
    fontSize: 6.8,
    fontWeight: "bold",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  studentName: {
    color: colors.ink,
    fontSize: 15,
    fontWeight: "bold",
    lineHeight: 1.15,
    marginTop: 4,
  },
  idBadge: {
    alignSelf: "flex-start",
    backgroundColor: colors.crimson,
    borderRadius: 4,
    color: colors.paper,
    fontSize: 7.2,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginTop: 6,
    paddingBottom: 3,
    paddingLeft: 8,
    paddingRight: 8,
    paddingTop: 3,
  },
  summaryText: {
    color: colors.muted,
    fontSize: 8,
    lineHeight: 1.35,
    marginTop: 6,
  },
  amountLabel: {
    color: colors.muted,
    fontSize: 6.8,
    fontWeight: "bold",
    letterSpacing: 0.7,
    textAlign: "right",
    textTransform: "uppercase",
  },
  amount: {
    color: colors.ink,
    fontSize: 24,
    fontWeight: "bold",
    lineHeight: 1,
    marginTop: 4,
    textAlign: "right",
  },
  amountWords: {
    color: colors.muted,
    fontSize: 7.8,
    lineHeight: 1.3,
    marginTop: 7,
    textAlign: "right",
  },
  splitRow: {
    flexDirection: "row",
    marginBottom: 12,
  },
  panel: {
    borderColor: colors.line,
    borderRadius: 7,
    borderStyle: "solid",
    borderWidth: 1,
    paddingBottom: 9,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 9,
  },
  panelLeft: {
    marginRight: 6,
    width: "50%",
  },
  panelRight: {
    marginLeft: 6,
    width: "50%",
  },
  sectionTitle: {
    color: colors.crimson,
    fontSize: 7.5,
    fontWeight: "bold",
    letterSpacing: 0.8,
    marginBottom: 8,
    textTransform: "uppercase",
  },
  detailLine: {
    borderBottomColor: colors.line,
    borderBottomStyle: "solid",
    borderBottomWidth: 0.7,
    marginBottom: 6,
    paddingBottom: 5,
  },
  detailLineLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  detailLabel: {
    color: colors.muted,
    fontSize: 6.5,
    fontWeight: "bold",
    letterSpacing: 0.4,
    marginBottom: 2,
    textTransform: "uppercase",
  },
  detailValue: {
    color: colors.ink,
    fontSize: 8.8,
    fontWeight: "bold",
    lineHeight: 1.25,
  },
  settlementPanel: {
    backgroundColor: colors.warm,
    borderColor: colors.gold,
    borderRadius: 7,
    borderStyle: "solid",
    borderWidth: 1,
    marginBottom: 12,
    paddingBottom: 8,
    paddingLeft: 10,
    paddingRight: 10,
    paddingTop: 8,
  },
  settlementHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  settlementTitle: {
    color: colors.ink,
    fontSize: 7.8,
    fontWeight: "bold",
    letterSpacing: 0.7,
    textTransform: "uppercase",
  },
  paidPill: {
    color: colors.green,
    fontSize: 7,
    fontWeight: "bold",
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  settlementRow: {
    borderTopColor: colors.line,
    borderTopStyle: "solid",
    borderTopWidth: 0.6,
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 5,
    paddingTop: 5,
  },
  settlementLabel: {
    color: colors.muted,
    fontSize: 8,
  },
  settlementValue: {
    color: colors.ink,
    fontSize: 8,
    fontWeight: "bold",
    maxWidth: 270,
    textAlign: "right",
  },
  settlementTotalLabel: {
    color: colors.ink,
    fontSize: 8.8,
    fontWeight: "bold",
    textTransform: "uppercase",
  },
  settlementTotalValue: {
    color: colors.ink,
    fontSize: 11.5,
    fontWeight: "bold",
    textAlign: "right",
  },
  footerRow: {
    alignItems: "center",
    borderTopColor: colors.line,
    borderTopStyle: "solid",
    borderTopWidth: 1,
    flexDirection: "row",
    justifyContent: "space-between",
    paddingTop: 10,
  },
  statusBlock: {
    paddingRight: 10,
    width: "68%",
  },
  status: {
    color: colors.green,
    fontSize: 10,
    fontWeight: "bold",
    letterSpacing: 0.8,
    textTransform: "uppercase",
  },
  statusText: {
    color: colors.muted,
    fontSize: 7.5,
    lineHeight: 1.35,
    marginTop: 4,
  },
  stampWrap: {
    alignItems: "center",
    width: "32%",
  },
  stamp: {
    height: 56,
    objectFit: "contain",
    opacity: 0.85,
    width: 56,
    transform: "rotate(-10deg)",
  },
  signatureLine: {
    borderTopColor: colors.ink,
    borderTopStyle: "solid",
    borderTopWidth: 0.9,
    height: 1,
    marginTop: 5,
    width: 112,
  },
  signatureLabel: {
    color: colors.muted,
    fontSize: 6.8,
    fontWeight: "bold",
    letterSpacing: 0.5,
    marginTop: 5,
    textAlign: "center",
    textTransform: "uppercase",
  },
  footer: {
    backgroundColor: colors.dark,
    borderTopWidth: 3,
    borderTopColor: colors.gold,
    paddingBottom: 9,
    paddingLeft: 18,
    paddingRight: 18,
    paddingTop: 9,
  },
  footerText: {
    color: "#c8d0d8",
    fontSize: 7.2,
    lineHeight: 1.35,
    textAlign: "center",
  },
});

function currency(amount: number) {
  return `INR ${amount.toLocaleString("en-IN")}`;
}

function DetailField({
  label,
  children,
  last = false,
}: {
  label: string;
  children: ReactNode;
  last?: boolean;
}) {
  const lineStyle = last
    ? [styles.detailLine, styles.detailLineLast]
    : styles.detailLine;

  return (
    <View style={lineStyle}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={styles.detailValue}>{children}</Text>
    </View>
  );
}

function SettlementRow({
  label,
  value,
  total = false,
}: {
  label: string;
  value: string;
  total?: boolean;
}) {
  return (
    <View style={styles.settlementRow}>
      <Text style={total ? styles.settlementTotalLabel : styles.settlementLabel}>
        {label}
      </Text>
      <Text style={total ? styles.settlementTotalValue : styles.settlementValue}>
        {value}
      </Text>
    </View>
  );
}

const ONES = ["", "One", "Two", "Three", "Four", "Five", "Six", "Seven", "Eight", "Nine", "Ten", "Eleven", "Twelve", "Thirteen", "Fourteen", "Fifteen", "Sixteen", "Seventeen", "Eighteen", "Nineteen"];
const TENS = ["", "", "Twenty", "Thirty", "Forty", "Fifty", "Sixty", "Seventy", "Eighty", "Ninety"];

function wordsBelowThousand(value: number) {
  const hundred = Math.floor(value / 100);
  const remainder = value % 100;
  const parts: string[] = [];

  if (hundred > 0) {
    parts.push(`${ONES[hundred]} Hundred`);
  }

  if (remainder > 0) {
    if (remainder < 20) {
      parts.push(ONES[remainder]);
    } else {
      const ten = Math.floor(remainder / 10);
      const one = remainder % 10;
      parts.push([TENS[ten], ONES[one]].filter(Boolean).join(" "));
    }
  }

  return parts.join(" ");
}

export function amountToIndianWords(value: number) {
  const amount = Math.max(0, Math.round(value));
  if (amount === 0) return "Rupees Zero Only";

  const crore = Math.floor(amount / 10000000);
  const lakh = Math.floor((amount % 10000000) / 100000);
  const thousand = Math.floor((amount % 100000) / 1000);
  const rest = amount % 1000;

  const parts = [
    crore ? `${wordsBelowThousand(crore)} Crore` : "",
    lakh ? `${wordsBelowThousand(lakh)} Lakh` : "",
    thousand ? `${wordsBelowThousand(thousand)} Thousand` : "",
    rest ? wordsBelowThousand(rest) : "",
  ].filter(Boolean);

  return `Rupees ${parts.join(" ")} Only`;
}

interface ReceiptProps {
  receiptId: string
  studentName: string
  parentName?: string
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

const logoPath = path.join(process.cwd(), 'public/logo/SKF logo.png')
const stampPath = path.join(process.cwd(), 'public/logo/stamp.png')

const formatDate = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleDateString('en-IN', { day: '2-digit', month: 'long', year: 'numeric' })
}

const formatTime = (value?: string) => {
  if (!value) return '-'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return '-'
  return date.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
}

const formatDateTime = (value?: string) => {
  const date = formatDate(value)
  const time = formatTime(value)
  if (date === '-' && time === '-') return '-'
  return `${date}, ${time}`
}

function feeTypeLabel(feeType: string) {
  return String(feeType || 'monthly')
    .replace(/_/g, ' ')
    .split(' ')
    .filter(Boolean)
    .map((word) => `${word.charAt(0).toUpperCase()}${word.slice(1)}`)
    .join(' ')
}

function isMonthlyFee(feeType: string) {
  return String(feeType || '').toLowerCase().includes('monthly')
}

export function ReceiptDocument(props: ReceiptProps) {
  const purpose = isMonthlyFee(props.feeType) ? `${props.month} Monthly Training Fee` : `${feeTypeLabel(props.feeType)} ${props.year}`
  const amountWords = amountToIndianWords(props.amount)

  return (
    <Document
      author="SKF Karate"
      creator="SKF Athlete Portal"
      producer="SKF Athlete Portal"
      subject={`${purpose} receipt`}
      title={`${props.skfId} ${purpose}`}
    >
      <Page size="A4" style={styles.page} wrap={false}>
        <View style={styles.receipt}>
          <View style={styles.topBand}>
            <View style={styles.brandBlock}>
              {/* eslint-disable-next-line jsx-a11y/alt-text */}
              <Image src={logoPath} style={styles.logo} />
              <View>
                <Text style={styles.brand}>S K F KARATE</Text>
                <Text style={styles.association}>
                  Sports Karate-do Fitness & Self Defence Association (R)
                </Text>
              </View>
            </View>
            <View style={styles.receiptHead}>
              <Text style={styles.documentTitle}>Fee Receipt</Text>
              <Text style={styles.receiptPill}>{props.receiptId}</Text>
            </View>
          </View>
          <View style={styles.accentRail}>
            <View style={styles.accentRed} />
            <View style={styles.accentGold} />
          </View>

          <View style={styles.body}>
            <View style={styles.summary}>
              <View style={styles.summaryAccent} />
              <View style={styles.summaryLeft}>
                <Text style={styles.kicker}>Received from</Text>
                <Text style={styles.studentName}>{props.studentName}</Text>
                <Text style={styles.idBadge}>{props.skfId}</Text>
                <Text style={styles.summaryText}>
                  Fee received for {purpose}. Parent / guardian: {props.parentName || 'N/A'}.
                </Text>
              </View>
              <View style={styles.summaryRight}>
                <Text style={styles.amountLabel}>Amount Received</Text>
                <Text style={styles.amount}>{currency(props.amount)}</Text>
                <Text style={styles.amountWords}>{amountWords}</Text>
              </View>
            </View>

            <View style={styles.splitRow}>
              <View style={[styles.panel, styles.panelLeft]}>
                <Text style={styles.sectionTitle}>Receipt Details</Text>
                <DetailField label="Branch">{props.branch}</DetailField>
                <DetailField label="Receipt No">{props.receiptId}</DetailField>
                <DetailField label="Date">{formatDate(props.paidDate)}</DetailField>
                <DetailField label="Time" last>
                  {formatTime(props.paidDate)}
                </DetailField>
              </View>
              <View style={[styles.panel, styles.panelRight]}>
                <Text style={styles.sectionTitle}>Student Record</Text>
                <DetailField label="Student Name">{props.studentName}</DetailField>
                <DetailField label="SKF ID">{props.skfId}</DetailField>
                <DetailField label="Parent / Guardian">
                  {props.parentName || 'N/A'}
                </DetailField>
                <DetailField label="Purpose" last>
                  {purpose}
                </DetailField>
              </View>
            </View>

            <View style={styles.settlementPanel}>
              <View style={styles.settlementHeader}>
                <Text style={styles.settlementTitle}>Settlement Summary</Text>
                <Text style={styles.paidPill}>Verified Paid</Text>
              </View>
              <SettlementRow
                label="Issued at"
                value={formatDateTime(props.issuedAt || props.verifiedAt || props.paidDate)}
              />
              <SettlementRow
                label="Amount received"
                total
                value={currency(props.amount)}
              />
            </View>

            <View style={styles.footerRow}>
              <View style={styles.statusBlock}>
                <Text style={styles.status}>Payment Received with Thanks</Text>
                <Text style={styles.statusText}>
                  Dojo: {props.dojoAddress || props.branch}. This receipt confirms fee
                  collection for the period shown above and should be retained for records.
                </Text>
              </View>
              <View style={styles.stampWrap}>
                {/* eslint-disable-next-line jsx-a11y/alt-text */}
                <Image src={stampPath} style={styles.stamp} />
                <View style={styles.signatureLine} />
                <Text style={styles.signatureLabel}>Authorized Seal</Text>
              </View>
            </View>
          </View>

          <View style={styles.footer}>
            <Text style={styles.footerText}>
              This receipt is issued for confirmation and record purposes only.
            </Text>
          </View>
        </View>
      </Page>
    </Document>
  );
}
