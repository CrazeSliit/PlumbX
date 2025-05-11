import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
  page: {
    padding: 30,
    fontSize: 12,
  },
  header: {
    marginBottom: 20,
    borderBottom: 1,
    paddingBottom: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  logo: {
    width: 100,
    height: 50,
    marginRight: 20,
  },
  headerText: {
    flex: 1,
  },
  companyName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 5,
  },
  companyDetails: {
    fontSize: 10,
    color: '#666',
  },
  title: {
    fontSize: 24,
    marginBottom: 10,
    textAlign: 'center',
  },
  section: {
    marginBottom: 15,
  },
  row: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  label: {
    width: '30%',
    fontWeight: 'bold',
  },
  value: {
    width: '70%',
  },
  table: {
    marginTop: 10,
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: 1,
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    marginBottom: 5,
  },
  tableCell: {
    width: '25%',
  },
  total: {
    marginTop: 10,
    paddingTop: 5,
    borderTop: 1,
    fontWeight: 'bold',
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 30,
    right: 30,
    fontSize: 10,
    textAlign: 'center',
    color: '#666',
    borderTop: 1,
    paddingTop: 10,
  },
  footerText: {
    marginBottom: 5,
  },
  pageNumber: {
    position: 'absolute',
    bottom: 15,
    left: 0,
    right: 0,
    textAlign: 'center',
    fontSize: 10,
    color: '#666',
  },
  validUntil: {
    marginTop: 20,
    padding: 10,
    backgroundColor: '#f5f5f5',
    textAlign: 'center',
    fontSize: 10,
  },
});

const QuotationPDF = ({ items, totalAmount }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header with Logo and Company Details */}
      <View style={styles.header}>
        <Image
          src="/logo.png"
          style={styles.logo}
        />
        <View style={styles.headerText}>
          <Text style={styles.companyName}>Plumb-X</Text>
          <Text style={styles.companyDetails}>
            123 Plumbing Street, City, State 12345
          </Text>
          <Text style={styles.companyDetails}>
            Phone: (555) 123-4567 | Email: info@plumb-x.com
          </Text>
          <Text style={styles.companyDetails}>
            Website: www.plumb-x.com
          </Text>
        </View>
      </View>

      <Text style={styles.title}>Quotation</Text>

      <View style={styles.section}>
        <View style={styles.row}>
          <Text style={styles.label}>Date:</Text>
          <Text style={styles.value}>{new Date().toLocaleDateString()}</Text>
        </View>
        <View style={styles.row}>
          <Text style={styles.label}>Quotation Number:</Text>
          <Text style={styles.value}>QT-{Date.now().toString().slice(-6)}</Text>
        </View>
      </View>

      <View style={styles.section}>
        <Text style={{ marginBottom: 5, fontWeight: 'bold' }}>Items</Text>
        <View style={styles.table}>
          <View style={styles.tableHeader}>
            <Text style={styles.tableCell}>Item</Text>
            <Text style={styles.tableCell}>Quantity</Text>
            <Text style={styles.tableCell}>Unit Price</Text>
            <Text style={styles.tableCell}>Total</Text>
          </View>
          {items.map((item, index) => (
            <View key={index} style={styles.tableRow}>
              <Text style={styles.tableCell}>{item.name}</Text>
              <Text style={styles.tableCell}>{item.quantity}</Text>
              <Text style={styles.tableCell}>${item.price.toFixed(2)}</Text>
              <Text style={styles.tableCell}>${(item.price * item.quantity).toFixed(2)}</Text>
            </View>
          ))}
          <View style={[styles.tableRow, styles.total]}>
            <Text style={styles.tableCell}>Total Amount:</Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}></Text>
            <Text style={styles.tableCell}>${totalAmount.toFixed(2)}</Text>
          </View>
        </View>
      </View>

      <View style={styles.validUntil}>
        <Text>This quotation is valid for 7 days from the date of issue.</Text>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          Thank you for considering Plumb-X for your plumbing needs
        </Text>
        <Text style={styles.footerText}>
          For any inquiries, please contact our sales team at (555) 123-4567
        </Text>
        <Text style={styles.footerText}>
          This is a computer-generated quotation. No signature required.
        </Text>
      </View>

      {/* Page Number */}
      <Text style={styles.pageNumber} render={({ pageNumber, totalPages }) => (
        `${pageNumber} / ${totalPages}`
      )} fixed />
    </Page>
  </Document>
);

export default QuotationPDF; 