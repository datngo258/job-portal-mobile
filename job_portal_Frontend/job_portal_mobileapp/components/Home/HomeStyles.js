import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 20,
    backgroundColor: "#f5f7fa",
  },
  containerCenter: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#f5f7fa",
    paddingHorizontal: 20,
  },
  jobCard: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 20,
    marginVertical: 8,
    // shadow iOS
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    // shadow Android
    elevation: 4,
  },
  jobTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: "#222",
    marginBottom: 8,
  },
  jobDetail: {
    fontSize: 15,
    color: "#555",
    marginBottom: 4,
  },
  errorText: {
    color: "red",
    fontSize: 16,
    marginBottom: 15,
    textAlign: "center",
  },
  reloadBtn: {
    backgroundColor: "#007bff",
    paddingVertical: 12,
    paddingHorizontal: 40,
    borderRadius: 25,
  },
  reloadBtnText: {
    color: "white",
    fontWeight: "600",
    fontSize: 16,
  },
  emptyText: {
    color: "#777",
    fontSize: 16,
    textAlign: "center",
    marginTop: 50,
  },
  searchWrapper: {
    alignItems: "center", // căn giữa ScrollView theo chiều ngang
    marginBottom: 10,
  },

  searchContainer: {
    maxHeight: 50,
    width: "100%",
    backgroundColor: "#f0f0f0",
  },

  searchContent: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
  },

  input: {
    height: 40,
    width: 180,
    marginRight: 10,
    paddingHorizontal: 10,
    borderColor: "#aaa",
    borderWidth: 1,
    borderRadius: 6,
    backgroundColor: "#fff",
  },
});
