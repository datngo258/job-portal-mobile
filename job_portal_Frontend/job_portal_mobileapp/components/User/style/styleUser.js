import { StyleSheet } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#f5f6fa",
    alignItems: "center",
  },
  center: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  avatar: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginBottom: 20,
    borderWidth: 2,
    borderColor: "#3498db",
  },
  role: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#2c3e50",
    marginBottom: 10,
  },
  label: {
    fontSize: 16,
    marginTop: 8,
    color: "#34495e",
  },
  value: {
    fontWeight: "600",
    color: "#2c3e50",
  },
  infoNote: {
    marginTop: 16,
    fontStyle: "italic",
    color: "#7f8c8d",
    textAlign: "center",
  },
  applicationItem: {
    marginLeft: 10,
    marginVertical: 2,
  },
  card: {
    backgroundColor: "#fff",
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
    width: "100%",
  },
  applicationsContainer: {
    paddingHorizontal: 16,
  },

  applicationWrapper: {
    width: "100%",
    marginBottom: 12,
  },

  jobTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 4,
  },

  status: {
    fontSize: 14,
    marginBottom: 8,
  },

  actionRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    gap: 10,
  },

  buttonEdit: {
    backgroundColor: "#4CAF50",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  buttonDelete: {
    backgroundColor: "#f44336",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },

  buttonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 13,
  },
  cmt: {
    backgroundColor: "blue",
    padding: 10,
    borderRadius: 5,
    alignItems: "center",
  },
});

export default styles;
