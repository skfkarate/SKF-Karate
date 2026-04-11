import { Document, Page, Image, Text } from '@react-pdf/renderer'
import { CertificateData } from './CertificateRenderer'

export function CertificatePDF({ data }: { data: CertificateData }) {
  return (
    <Document>
      <Page size={[2480, 1754]} orientation="landscape" style={{ position: 'relative' }}>
        <Image src={data.templateImageUrl} style={{ position: 'absolute', top: 0, left: 0, width: 2480, height: 1754 }} />
        {data.fields.map((field) => (
          <Text key={field.id} style={{
            position: 'absolute',
            left: (field.x / 100) * 2480,
            top: (field.y / 100) * 1754,
            fontSize: field.fontSize * (2480 / 1240),
            color: field.color || '#000000',
            fontWeight: field.bold ? 'bold' : 'normal',
            textAlign: field.align === 'center' ? 'center' : field.align === 'right' ? 'right' : 'left'
          }}>
            {field.value}
          </Text>
        ))}
      </Page>
    </Document>
  )
}
