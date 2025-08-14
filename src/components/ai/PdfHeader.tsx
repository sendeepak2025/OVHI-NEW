// components/PdfHeader.tsx
import React from "@react-pdf/renderer";
const { View, Text, Image, StyleSheet } = React;

export const PdfHeader = ({ pdfHeader }: any) => {
  return (
    <View style={styles.headerWrapper}>
      {/* Left: Logo + Organization */}
      <View style={styles.left}>
        {pdfHeader.logo_base64 || pdfHeader.logo_url ? (
          <Image
            style={styles.logo}
            src={pdfHeader.logo_base64 || pdfHeader.logo_url}
          />
        ) : (
          <View style={styles.logoPlaceholder}>
            <Text style={styles.logoText}>LOGO</Text>
          </View>
        )}

        {pdfHeader?.organization_name_enabled &&
          pdfHeader.organization_name_value && (
            <Text style={styles.orgName}>
              {pdfHeader.organization_name_value}
            </Text>
          )}
        <Text style={styles.subtext}>Clinical Assessment Report</Text>
      </View>

      {/* Right: Info */}
      <View style={styles.right}>
        {pdfHeader?.phone_enabled && (
          <Text style={styles.infoText}>Ph: {pdfHeader.phone_value}</Text>
        )}
        {pdfHeader?.fax_enabled && (
          <Text style={styles.infoText}>Fax: {pdfHeader.fax_value}</Text>
        )}
        {pdfHeader?.email_enabled && (
          <Text style={styles.infoText}>{pdfHeader.email_value}</Text>
        )}
        {pdfHeader?.license_number_enabled && (
          <Text style={styles.infoText}>
            Lic: {pdfHeader.license_number_value}
          </Text>
        )}
        {pdfHeader?.address_enabled && (
          <Text style={styles.infoText}>{pdfHeader.address_value}</Text>
        )}
        {pdfHeader?.website_enabled && (
          <Text style={styles.infoText}>{pdfHeader.website_value}</Text>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  headerWrapper: {
    flexDirection: "row",
    borderBottomWidth: 1,
    borderBottomColor: "#2980b9",
    paddingBottom: 6,
    marginBottom: 12,
    justifyContent: "space-between",
  },
  left: {
    width: "55%",
  },
  right: {
    width: "40%",
    textAlign: "right",
  },
  logo: {
    width: 40,
    height: 40,
    marginBottom: 4,
  },
  logoPlaceholder: {
    width: 40,
    height: 40,
    backgroundColor: "#eee",
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 4,
  },
  logoText: {
    fontSize: 6,
    color: "#999",
  },
  orgName: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#2980b9",
    marginBottom: 2,
  },
  subtext: {
    fontSize: 9,
    color: "#666",
  },
  infoText: {
    fontSize: 8,
    color: "#444",
    marginBottom: 2,
  },
});
