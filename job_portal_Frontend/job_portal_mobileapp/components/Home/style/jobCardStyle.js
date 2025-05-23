import { StyleSheet } from "react-native";

const jobCardStyle = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 15,
    borderRadius: 12,
    marginBottom: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#1976d2",
  },
  description: {
    color: "#555",
    marginTop: 4,
    fontSize: 14,
  },
  infoRow: {
    flexDirection: "row",
    marginTop: 6,
    alignItems: "center",
  },
  infoText: {
    color: "#666",
    marginLeft: 4,
  },
});

export default jobCardStyle;
