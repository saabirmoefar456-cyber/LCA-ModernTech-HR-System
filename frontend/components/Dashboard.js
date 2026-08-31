const DashboardComponent = {
  data() {
    return {
      employees: [],
      leaveRequests: [],
      loading: true,
      error: "",
      attendanceSummary: {
        present: 11,
        absent: 3,
        late: 2,
        total: 16,
      },
      currentTime: "",
    };
  },

  computed: {
    totalPayroll() {
      return this.employees.reduce((sum, e) => sum + Number(e.salary), 0);
    },
    departmentBreakdown() {
      const depts = {};
      this.employees.forEach((emp) => {
        const name = emp.department_name;
        if (!depts[name]) {
          depts[name] = { count: 0, totalSalary: 0 };
        }
        depts[name].count++;
        depts[name].totalSalary += Number(emp.salary);
      });
      return Object.entries(depts)
        .map(([name, data]) => ({
          name,
          count: data.count,
          totalSalary: data.totalSalary,
        }))
        .sort((a, b) => b.count - a.count);
    },
    pendingLeave() {
      return this.leaveRequests.filter((r) => r.status === "Pending");
    },
    activeEmployees() {
      return this.employees.filter((e) => e.status === "Active").length;
    },
    onLeaveEmployees() {
      return this.employees.filter((e) => e.status === "On Leave").length;
    },
    attendanceRate() {
      const present =
        this.attendanceSummary.present + this.attendanceSummary.late;
      return Math.round((present / this.attendanceSummary.total) * 100);
    },
    recentHires() {
      return [...this.employees]
        .sort((a, b) => new Date(b.hire_date) - new Date(a.hire_date))
        .slice(0, 4);
    },
  },

  methods: {
    async loadData() {
      this.loading = true;
      this.error = "";
      try {
        const [employees, requests] = await Promise.all([
          window.api.getEmployees(),
          window.api.getTimeOffRequests(),
        ]);
        this.employees = employees;
        this.leaveRequests = requests;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
    formatSalary(amount) {
      return "R " + Number(amount).toLocaleString("en-ZA");
    },
    updateTime() {
      const now = new Date();
      this.currentTime = now.toLocaleTimeString("en-ZA", {
        hour: "2-digit",
        minute: "2-digit",
        second: "2-digit",
      });
    },
    formatToday() {
      return new Date().toLocaleDateString("en-ZA", {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      });
    },
    // MySQL returns full timestamps — trim to just the date part
    formatDate(dateStr) {
      if (!dateStr) return "";
      return dateStr.slice(0, 10);
    },
    statusBadge(status) {
      if (status === "Approved") return "badge bg-success";
      if (status === "Pending") return "badge bg-warning text-dark";
      if (status === "Denied") return "badge bg-danger";
      return "badge bg-secondary";
    },
    deptBarWidth(count) {
      const max = Math.max(...this.departmentBreakdown.map((d) => d.count));
      return Math.round((count / max) * 100) + "%";
    },
  },

  mounted() {
    this.loadData();
    this.updateTime();
    setInterval(this.updateTime, 1000);
  },

  template: `
    <div>
      <div class="d-flex justify-content-between align-items-start mb-4">
        <div>
          <h3 class="mb-0">📊 Dashboard</h3>
          <small class="text-muted">{{ formatToday() }}</small>
        </div>
        <div class="text-end">
          <div class="fs-4 fw-bold text-primary">{{ currentTime }}</div>
          <small class="text-muted">Current Time</small>
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loading" class="text-muted">Loading dashboard...</div>

      <template v-else>
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card shadow-sm border-0 bg-primary text-white">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div class="small opacity-75">Total Employees</div>
                  <div class="fs-2 fw-bold">{{ employees.length }}</div>
                </div>
                <div class="fs-1 opacity-50">👥</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm border-0 bg-success text-white">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div class="small opacity-75">Active Employees</div>
                  <div class="fs-2 fw-bold">{{ activeEmployees }}</div>
                </div>
                <div class="fs-1 opacity-50">✅</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm border-0 bg-warning text-dark">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div class="small opacity-75">On Leave</div>
                  <div class="fs-2 fw-bold">{{ onLeaveEmployees }}</div>
                </div>
                <div class="fs-1 opacity-50">🗓️</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card shadow-sm border-0 bg-dark text-white">
              <div class="card-body d-flex justify-content-between align-items-center">
                <div>
                  <div class="small opacity-75">Monthly Payroll</div>
                  <div class="fs-5 fw-bold">{{ formatSalary(totalPayroll) }}</div>
                </div>
                <div class="fs-1 opacity-50">💰</div>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-md-5">
            <div class="card shadow-sm h-100">
              <div class="card-header fw-bold bg-light">
                ✅ Today's Attendance
              </div>
              <div class="card-body">
                <div class="row g-2 mb-3">
                  <div class="col-4 text-center">
                    <div class="fs-3 fw-bold text-success">
                      {{ attendanceSummary.present }}
                    </div>
                    <small class="text-muted">Present</small>
                  </div>
                  <div class="col-4 text-center">
                    <div class="fs-3 fw-bold text-danger">
                      {{ attendanceSummary.absent }}
                    </div>
                    <small class="text-muted">Absent</small>
                  </div>
                  <div class="col-4 text-center">
                    <div class="fs-3 fw-bold text-warning">
                      {{ attendanceSummary.late }}
                    </div>
                    <small class="text-muted">Late</small>
                  </div>
                </div>
                <div class="mb-1 d-flex justify-content-between">
                  <small>Attendance Rate</small>
                  <small class="fw-bold">{{ attendanceRate }}%</small>
                </div>
                <div class="progress mb-3" style="height: 12px;">
                  <div
                    class="progress-bar bg-success"
                    :style="'width:' + attendanceRate + '%'">
                  </div>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-success">■ Present</small>
                  <small>{{ attendanceSummary.present }} / {{ attendanceSummary.total }}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center mb-1">
                  <small class="text-danger">■ Absent</small>
                  <small>{{ attendanceSummary.absent }} / {{ attendanceSummary.total }}</small>
                </div>
                <div class="d-flex justify-content-between align-items-center">
                  <small class="text-warning">■ Late</small>
                  <small>{{ attendanceSummary.late }} / {{ attendanceSummary.total }}</small>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-7">
            <div class="card shadow-sm h-100">
              <div class="card-header fw-bold bg-light d-flex justify-content-between">
                <span>⏳ Pending Leave Requests</span>
                <span class="badge bg-warning text-dark">
                  {{ pendingLeave.length }}
                </span>
              </div>
              <div class="card-body p-0">
                <div v-if="pendingLeave.length === 0"
                  class="text-center text-muted p-4">
                  No pending requests
                </div>
                <ul class="list-group list-group-flush">
                  <li
                    v-for="req in pendingLeave"
                    :key="req.id"
                    class="list-group-item">
                    <div class="d-flex justify-content-between align-items-center">
                      <div>
                        <div class="fw-semibold">{{ req.first_name }} {{ req.last_name }}</div>
                        <small class="text-muted">
                          {{ req.type }} · {{ formatDate(req.start_date) }}
                        </small>
                      </div>
                      <span :class="statusBadge(req.status)">
                        {{ req.status }}
                      </span>
                    </div>
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="row g-3 mb-4">
          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-header fw-bold bg-light">
                🏢 Employees by Department
              </div>
              <div class="card-body">
                <div
                  v-for="dept in departmentBreakdown"
                  :key="dept.name"
                  class="mb-3">
                  <div class="d-flex justify-content-between mb-1">
                    <small class="fw-semibold">{{ dept.name }}</small>
                    <small class="text-muted">{{ dept.count }} employee(s)</small>
                  </div>
                  <div class="progress" style="height: 10px;">
                    <div
                      class="progress-bar bg-primary"
                      :style="'width:' + deptBarWidth(dept.count)">
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div class="col-md-6">
            <div class="card shadow-sm">
              <div class="card-header fw-bold bg-light">
                🆕 Recent Hires
              </div>
              <ul class="list-group list-group-flush">
                <li
                  v-for="emp in recentHires"
                  :key="emp.id"
                  class="list-group-item">
                  <div class="d-flex justify-content-between align-items-center">
                    <div>
                      <div class="fw-semibold">{{ emp.first_name }} {{ emp.last_name }}</div>
                      <small class="text-muted">
                        {{ emp.job_title }} · {{ emp.department_name }}
                      </small>
                    </div>
                    <small class="text-muted">{{ formatDate(emp.hire_date) }}</small>
                  </div>
                </li>
              </ul>
            </div>
          </div>
        </div>

        <div class="card shadow-sm border-0 bg-dark text-white">
          <div class="card-body">
            <div class="row text-center g-3">
              <div class="col-md-3">
                <div class="small opacity-75">Total Employees</div>
                <div class="fs-4 fw-bold">{{ employees.length }}</div>
              </div>
              <div class="col-md-3">
                <div class="small opacity-75">Monthly Gross Payroll</div>
                <div class="fs-5 fw-bold text-success">
                  {{ formatSalary(totalPayroll) }}
                </div>
              </div>
              <div class="col-md-3">
                <div class="small opacity-75">Annual Gross Payroll</div>
                <div class="fs-5 fw-bold text-warning">
                  {{ formatSalary(totalPayroll * 12) }}
                </div>
              </div>
              <div class="col-md-3">
                <div class="small opacity-75">Avg Monthly Salary</div>
                <div class="fs-5 fw-bold text-info">
                  {{ formatSalary(Math.round(totalPayroll / employees.length)) }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </template>
    </div>
  `,
};
