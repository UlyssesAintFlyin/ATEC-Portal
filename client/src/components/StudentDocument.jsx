import React from "react";
import { Document, Page, Text, View, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#242C54" },
  title: { fontSize: 18, fontFamily: "Helvetica-Bold", marginBottom: 4, textAlign: "center" },
  subtitle: { fontSize: 9, color: "#666", marginBottom: 14 },
  sectionTitle: {
    fontSize: 12,
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 1,
    borderBottomColor: "#242C54",
    paddingBottom: 3,
    marginTop: 12,
    marginBottom: 6,
  },
  row: { flexDirection: "row", marginBottom: 5 },
  field: { flex: 1, paddingRight: 8 },
  label: { fontSize: 8, color: "#666", marginBottom: 1 },
  value: { fontSize: 10 },
  billRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 3,
    borderBottomWidth: 0.5,
    borderBottomColor: "#c9d3e0",
  },
  bold: { fontFamily: "Helvetica-Bold" },
});

const Field = ({ label, value }) => (
  <View style={styles.field}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "—"}</Text>
  </View>
);

// Helvetica has no ₱ glyph, so use "PHP" in the PDF
const money = (n) =>
  `PHP ${Number(n || 0).toLocaleString("en-PH", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function StudentPrintDocument({ student, age, section, billing }) {
  const fullName = [student.f_Name, student.m_Name, student.l_Name]
    .filter(Boolean)
    .join(" ");

  return (
    <Document title={`Student Information - ${fullName}`}>
      <Page size="A4" style={styles.page}>
        <Image src="/resources/print-header.png" style={{ width: '90%', alignSelf: "center", marginBottom: 6 }} />
        <Text style={styles.title}>Student's Information</Text>

        <Text style={styles.sectionTitle}>Personal Information</Text>
        <View style={styles.row}>
          <Field label="First Name" value={student.f_Name} />
          <Field label="Middle Name" value={student.m_Name} />
          <Field label="Surname" value={student.l_Name} />
        </View>
        <View style={styles.row}>
          <Field label="Age" value={String(age)} />
          <Field label="Gender" value={student.gender} />
          <Field label="Birthdate" value={student.birthdate} />
        </View>
        <View style={styles.row}>
          <Field label="Home Address" value={student.address} />
        </View>

        <Text style={styles.sectionTitle}>Contact Information</Text>
        <View style={styles.row}>
          <Field label="Email Address" value={student.email} />
          <Field label="Contact Number" value={student.contact_Number} />
        </View>

        <Text style={styles.sectionTitle}>Family Information</Text>
        <View style={styles.row}>
          <Field label="Father's Name" value={student.father_Name} />
          <Field label="Father's Contact" value={student.father_Contact} />
        </View>
        <View style={styles.row}>
          <Field label="Mother's Maiden Name" value={student.mother_Name} />
          <Field label="Mother's Contact" value={student.mother_Contact} />
        </View>
        <View style={styles.row}>
          <Field label="Guardian's Name" value={student.guardian_Name} />
          <Field label="Guardian's Contact" value={student.guardian_Contact} />
        </View>

        <Text style={styles.sectionTitle}>Program Information</Text>
        <View style={styles.row}>
          <Field label="Department" value={student.department} />
          <Field label="Course/Track" value={student.program} />
          <Field
            label="Year Level & Section"
            value={section ? `${section.gradeLevel} - ${section.section_Name}` : ""}
          />
        </View>

        <Text style={styles.sectionTitle}>Billing Information</Text>
        {billing.fees.length === 0 ? (
          <Text>Billing for this level is not set yet.</Text>
        ) : (
          <View>
            {billing.fees.map((f) => (
              <View key={f.label} style={styles.billRow}>
                <Text>{f.label}</Text>
                <Text>{money(f.amount)}</Text>
              </View>
            ))}
            <View style={styles.billRow}>
              <Text style={styles.bold}>Total fees</Text>
              <Text style={styles.bold}>{money(billing.totalFees)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text>
                Covered by {billing.fundedBy} ({billing.coveragePercent}%)
              </Text>
              <Text>- {money(billing.amountCovered)}</Text>
            </View>
            <View style={styles.billRow}>
              <Text style={styles.bold}>Amount due</Text>
              <Text style={styles.bold}>{money(billing.amountDue)}</Text>
            </View>
          </View>
        )}

        <Text style={styles.sectionTitle}>Account</Text>
        <View style={styles.row}>
          <Field label="Learner's Reference Number" value={student.lrn} />
          
        </View>
      </Page>
    </Document>
  );
}