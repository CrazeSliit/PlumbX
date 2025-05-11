import { Document, Page, Text, View, StyleSheet, Image } from '@react-pdf/renderer';

const styles = StyleSheet.create({
    page: {
        padding: 30,
        fontFamily: 'Helvetica',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        marginBottom: 20,
        borderBottom: 1,
        paddingBottom: 10,
    },
    logo: {
        width: 100,
        height: 50,
    },
    headerText: {
        fontSize: 10,
        textAlign: 'right',
    },
    title: {
        fontSize: 20,
        textAlign: 'center',
        marginBottom: 20,
        fontWeight: 'bold',
    },
    table: {
        display: 'flex',
        width: 'auto',
        borderStyle: 'solid',
        borderWidth: 1,
        borderRightWidth: 0,
        borderBottomWidth: 0,
    },
    tableRow: {
        flexDirection: 'row',
    },
    tableCol: {
        width: '20%',
        borderStyle: 'solid',
        borderWidth: 1,
        borderLeftWidth: 0,
        borderTopWidth: 0,
    },
    tableHeader: {
        backgroundColor: '#f0f0f0',
        padding: 5,
        fontSize: 10,
        fontWeight: 'bold',
    },
    tableCell: {
        padding: 5,
        fontSize: 9,
    },
    footer: {
        position: 'absolute',
        bottom: 30,
        left: 30,
        right: 30,
        fontSize: 8,
        textAlign: 'center',
        borderTop: 1,
        paddingTop: 10,
    },
});

const EmployeePDF = ({ employees }) => (
    <Document>
        <Page size="A4" style={styles.page}>
            <View style={styles.header}>
                <Image src="/logo.png" style={styles.logo} />
                <View style={styles.headerText}>
                    <Text>Plumb-X</Text>
                    <Text>No 103,Highlevel Road,</Text>
                    <Text>Rathnapura, Sri Lanka</Text>
                    <Text>Tel: +94 710181248</Text>
                    <Text>Email: HR@plumbx.com</Text>
                    <Text>www.plumbx.com</Text>
                </View>
            </View>

            <Text style={styles.title}>Employee List</Text>

            <View style={styles.table}>
                <View style={styles.tableRow}>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableHeader}>Employee ID</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableHeader}>Name</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableHeader}>Department</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableHeader}>Position</Text>
                    </View>
                    <View style={styles.tableCol}>
                        <Text style={styles.tableHeader}>Status</Text>
                    </View>
                </View>
                {employees.map((employee) => (
                    <View style={styles.tableRow} key={employee._id}>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{employee.employeeId}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{employee.fullName}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{employee.department}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{employee.position}</Text>
                        </View>
                        <View style={styles.tableCol}>
                            <Text style={styles.tableCell}>{employee.status}</Text>
                        </View>
                    </View>
                ))}
            </View>

            <View style={styles.footer}>
                <Text>Thank you for choosing Plumb-X</Text>
                <Text>For any inquiries, please contact our customer service at support@plumbx.com</Text>
                <Text>This is a computer-generated document and does not require a signature</Text>
            </View>
        </Page>
    </Document>
);

export default EmployeePDF; 