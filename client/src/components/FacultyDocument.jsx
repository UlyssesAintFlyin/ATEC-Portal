import React from "react";
import { Document, Page, View, Text, Image, StyleSheet } from "@react-pdf/renderer";

const styles = StyleSheet.create({
  page: { padding: 40, fontSize: 11, color: "#242C54" },
  title: { fontSize: 20, fontWeight: "bold", marginBottom: 16 },
  section: { marginBottom: 14 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "bold",
    borderBottom: "1px solid #242C54",
    paddingBottom: 3,
    marginBottom: 6,
  },
  row: { flexDirection: "row", paddingVertical: 3 },
  label: { width: 160, fontWeight: "bold" },
  value: { flex: 1 },
});

const Row = ({ label, value }) => (
  <View style={styles.row}>
    <Text style={styles.label}>{label}</Text>
    <Text style={styles.value}>{value || "-"}</Text>
  </View>
);

export default function FacultyPrintDocument({ faculty, age }) {
  const fullName = [faculty.f_Name, faculty.m_Name, faculty.l_Name]
    .filter(Boolean)
    .join(" ");

  return (
    <Document title={`Faculty - ${fullName}`}>
      <Page size="A4" style={styles.page}>
        <Image src="/resources/print-header.png" style={{ width: '90%', alignSelf: "center", marginBottom: 6 }} />
        <Text style={styles.title}>Faculty Member's Information</Text>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Personal Information</Text>
          <Row label="Name" value={fullName} />
          <Row label="Birthdate" value={faculty.birthdate} />
          <Row label="Age" value={String(age ?? "")} />
          <Row label="Gender" value={faculty.gender} />
          <Row label="Home Address" value={faculty.address} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Contact Information</Text>
          <Row label="Email Address" value={faculty.email} />
          <Row label="Contact Number" value={faculty.contact_Number} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Emergency Contact</Text>
          <Row label="Name" value={faculty.emergency_Name} />
          <Row label="Number" value={faculty.emergency_Number} />
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Credentials & Affiliation</Text>
          <Row label="Employee ID" value={String(faculty.faculty_ID ?? "")} />
          <Row label="Position" value={faculty.position} />
          <Row label="Status" value={faculty.status} />
          <Row label="Role" value={faculty.role} />
          <Row label="LET Passer" value={faculty.letPasser} />
          <Row label="Date Hired" value={faculty.dateHired} />
          <Row label="Past Jobs / Experience" value={faculty.pastJobs} />
          <Row
            label="Certificates"
            value={(faculty.certificates || [])
              .map((c, i) => c.name || `Certificate ${i + 1}`)
              .join(", ")}
          />
        </View>
      </Page>
    </Document>
  );
}