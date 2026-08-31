const app = Vue.createApp({
  data() {
    return {
      // This controls which page is visible
      currentPage: "dashboard",
      // null until the user logs in
      currentUser: window.api.getStoredUser(),
    };
  },

  computed: {
    isLoggedIn() {
      return !!this.currentUser && !!window.api.getToken();
    },
  },

  methods: {
    handleLoggedIn(user) {
      this.currentUser = user;
    },
    handleLogout() {
      window.api.logout();
      this.currentUser = null;
      this.currentPage = "dashboard";
    },
  },
});

// Register all components
app.component("login-component", LoginComponent);
app.component("dashboard-component", DashboardComponent);
app.component("employees-component", EmployeesComponent);
app.component("payroll-component", PayrollComponent);
app.component("timeoff-component", TimeOffComponent);
app.component("attendance-component", AttendanceComponent);

app.mount("#app");
