const AttendanceComponent = {
  data() {
    return {
      employees: [],
      selectedDate: new Date().toISOString().slice(0, 10),
      attendanceRecords: [
        {
          id: 1,
          employeeId: 1,
          employeeName: "James Thabo Molefe",
          date: "2026-06-19",
          status: "Present",
          timeIn: "08:00",
          timeOut: "17:00",
          notes: "",
        },
        {
          id: 2,
          employeeId: 2,
          employeeName: "Ayesha Patel",
          date: "2026-06-19",
          status: "Present",
          timeIn: "08:15",
          timeOut: "17:00",
          notes: "",
        },
        {
          id: 3,
          employeeId: 3,
          employeeName: "Sipho Ndlovu",
          date: "2026-06-19",
          status: "Late",
          timeIn: "09:30",
          timeOut: "17:00",
          notes: "Traffic",
        },
        {
          id: 4,
          employeeId: 4,
          employeeName: "Liezel van der Merwe",
          date: "2026-06-19",
          status: "Present",
          timeIn: "07:55",
          timeOut: "17:00",
          notes: "",
        },
        {
          id: 5,
          employeeId: 5,
          employeeName: "Kagiso Sithole",
          date: "2026-06-19",
          status: "Absent",
          timeIn: "",
          timeOut: "",
          notes: "Sick leave",
        },
        {
          id: 6,
          employeeId: 6,
          employeeName: "Fatima Daniels",
          date: "2026-06-19",
          status: "Present",
          timeIn: "08:00",
          timeOut: "17:00",
          notes: "",
        },
        {
          id: 7,
          employeeId: 7,
          employeeName: "Brendan Jacobs",
          date: "2026-06-19",
          status: "Present",
          timeIn: "08:05",
          timeOut: "13:00",
          notes: "Part-time",
        },
        {
          id: 8,
          employeeId: 8,
          employeeName: "Nompumelelo Dlamini",
          date: "2026-06-19",
          status: "Absent",
          timeIn: "",
          timeOut: "",
          notes: "Family responsibility",
        },
        {
          id: 9,
          employeeId: 9,
          employeeName: "Ruan Botha",
          date: "2026-06-19",
          status: "Present",
          timeIn: "08:00",
          timeOut: "17:00",
          notes: "",
        },
        {
          id: 10,
          employeeId: 10,
          employeeName: "Zanele Khumalo",
          date: "2026-06-19",
          status: "Late",
          timeIn: "09:00",
          timeOut: "17:00",
          notes: "Doctor appointment",
        },
        {
          id: 11,
          employeeId: 11,
          employeeName: "Dylan Petersen",
          date: "2026-06-19",
          status: "Present",
          timeIn: "08:00",
          timeOut: "17:00",
          notes: "",
        },
        {
          id: 12,
          employeeId: 12,
          employeeName: "Priya Naidoo",
          date: "2026-06-19",
          status: "Present",
          timeIn: "07:50",
          timeOut: "17:00",
          notes: "",
        },
        {
          id: 13,
          employeeId: 13,
          employeeName: "Andile Zulu",
          date: "2026-06-19",
          status: "Present",
          timeIn: "08:00",
          timeOut: "17:00",
          notes: "",
        },
        {
          id: 14,
          employeeId: 14,
          employeeName: "Chantal Rousseau",
          date: "2026-06-19",
          status: "Absent",
          timeIn: "",
          timeOut: "",
          notes: "Annual leave approved",
        },
        {
          id: 15,
          employeeId: 15,
          employeeName: "Sibusiso Mahlangu",
          date: "2026-06-19",
          status: "Present",
          timeIn: "08:10",
          timeOut: "17:00",
          notes: "",
        },
        {
          id: 16,
          employeeId: 16,
          employeeName: "Taryn Fisher",
          date: "2026-06-19",
          status: "Present",
          timeIn: "08:00",
          timeOut: "17:00",
          notes: "",
        },
      ],
      searchQuery: "",
      filterStatus: "",
    };
  },

  computed: {
    todaysRecords() {
      return this.attendanceRecords.filter((r) => r.date === this.selectedDate);
    },
    filteredRecords() {
      return this.todaysRecords.filter((r) => {
        const matchesSearch = r.employeeName
          .toLowerCase()
          .includes(this.searchQuery.toLowerCase());
        const matchesStatus =
          this.filterStatus === "" || r.status === this.filterStatus;
        return matchesSearch && matchesStatus;
      });
    },
    presentCount() {
      return this.todaysRecords.filter((r) => r.status === "Present").length;
    },
    absentCount() {
      return this.todaysRecords.filter((r) => r.status === "Absent").length;
    },
    lateCount() {
      return this.todaysRecords.filter((r) => r.status === "Late").length;
    },
    attendanceRate() {
      if (this.todaysRecords.length === 0) return 0;
      const present = this.presentCount + this.lateCount;
      return Math.round((present / this.todaysRecords.length) * 100);
    },
  },

  methods: {
    updateStatus(record, newStatus) {
      record.status = newStatus;
      if (newStatus === "Absent") {
        record.timeIn = "";
        record.timeOut = "";
      }
      if (newStatus === "Present" && !record.timeIn) {
        record.timeIn = "08:00";
        record.timeOut = "17:00";
      }
      if (newStatus === "Late" && !record.timeIn) {
        record.timeIn = "09:00";
        record.timeOut = "17:00";
      }
      localStorage.setItem(
        "attendanceRecords",
        JSON.stringify(this.attendanceRecords),
      );
    },

    loadDate() {
      const existing = this.attendanceRecords.filter(
        (r) => r.date === this.selectedDate,
      );
      if (existing.length === 0) {
        this.employees.forEach((emp) => {
          this.attendanceRecords.push({
            id: this.attendanceRecords.length + 1,
            employeeId: emp.id,
            employeeName: emp.first_name + " " + emp.last_name,
            date: this.selectedDate,
            status: "Present",
            timeIn: "08:00",
            timeOut: "17:00",
            notes: "",
          });
        });
      }
    },

    async loadEmployees() {
      try {
        this.employees = await window.api.getEmployees();
      } catch (err) {
        // Attendance isn't part of the core schema — fail quietly here
      }
    },

    statusBadge(status) {
      if (status === "Present") return "badge bg-success";
      if (status === "Absent") return "badge bg-danger";
      if (status === "Late") return "badge bg-warning text-dark";
      return "badge bg-secondary";
    },

    rateColour() {
      if (this.attendanceRate >= 90) return "bg-success";
      if (this.attendanceRate >= 75) return "bg-warning";
      return "bg-danger";
    },

    formatDate(date) {
      const options = {
        weekday: "long",
        year: "numeric",
        month: "long",
        day: "numeric",
      };
      return new Date(date).toLocaleDateString("en-ZA", options);
    },
  },

  mounted() {
    const saved = localStorage.getItem("attendanceRecords");
    if (saved) {
      this.attendanceRecords = JSON.parse(saved);
    }
    this.loadEmployees();
  },

  template: `
    <div>
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="mb-0">✅ Attendance</h3>
          <small class="text-muted">Daily attendance tracking</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <label class="fw-semibold">Date:</label>
          <input
            v-model="selectedDate"
            type="date"
            class="form-control"
            style="width: 180px;"
            @change="loadDate"
          />
        </div>
      </div>

      <div class="alert alert-dark mb-4">
        📅 Showing attendance for:
        <strong>{{ formatDate(selectedDate) }}</strong>
      </div>

      <div class="row g-3 mb-4">
        <div class="col-md-3">
          <div class="card text-white bg-primary shadow-sm">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <div class="small">Total Employees</div>
                <div class="fs-3 fw-bold">{{ todaysRecords.length }}</div>
              </div>
              <div class="fs-1 opacity-50">👥</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-success shadow-sm">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <div class="small">Present</div>
                <div class="fs-3 fw-bold">{{ presentCount }}</div>
              </div>
              <div class="fs-1 opacity-50">✅</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-danger shadow-sm">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <div class="small">Absent</div>
                <div class="fs-3 fw-bold">{{ absentCount }}</div>
              </div>
              <div class="fs-1 opacity-50">❌</div>
            </div>
          </div>
        </div>
        <div class="col-md-3">
          <div class="card text-white bg-warning shadow-sm">
            <div class="card-body d-flex justify-content-between align-items-center">
              <div>
                <div class="small">Late</div>
                <div class="fs-3 fw-bold">{{ lateCount }}</div>
              </div>
              <div class="fs-1 opacity-50">⏰</div>
            </div>
          </div>
        </div>
      </div>

      <div class="card mb-4 shadow-sm">
        <div class="card-body">
          <div class="d-flex justify-content-between mb-1">
            <span class="fw-semibold">Attendance Rate</span>
            <span class="fw-bold">{{ attendanceRate }}%</span>
          </div>
          <div class="progress" style="height: 20px;">
            <div
              class="progress-bar"
              :class="rateColour()"
              :style="'width: ' + attendanceRate + '%'"
              role="progressbar">
              {{ attendanceRate }}%
            </div>
          </div>
          <small class="text-muted mt-1 d-block">
            {{ presentCount + lateCount }} out of
            {{ todaysRecords.length }} employees present
          </small>
        </div>
      </div>

      <div class="row mb-3 g-2">
        <div class="col-md-6">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="🔍 Search employee..."
          />
        </div>
        <div class="col-md-4">
          <select v-model="filterStatus" class="form-select">
            <option value="">All Statuses</option>
            <option>Present</option>
            <option>Absent</option>
            <option>Late</option>
          </select>
        </div>
        <div class="col-md-2">
          <span class="form-control text-center bg-white text-muted">
            {{ filteredRecords.length }} shown
          </span>
        </div>
      </div>

      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="table-dark">
              <tr>
                <th>Employee</th>
                <th>Status</th>
                <th>Time In</th>
                <th>Time Out</th>
                <th>Notes</th>
                <th>Update</th>
              </tr>
            </thead>
            <tbody>
              <tr v-for="record in filteredRecords" :key="record.id">
                <td class="fw-semibold">{{ record.employeeName }}</td>
                <td>
                  <span :class="statusBadge(record.status)">
                    {{ record.status }}
                  </span>
                </td>
                <td>
                  <input
                    v-model="record.timeIn"
                    type="time"
                    class="form-control form-control-sm"
                    style="width: 110px;"
                    :disabled="record.status === 'Absent'"
                  />
                </td>
                <td>
                  <input
                    v-model="record.timeOut"
                    type="time"
                    class="form-control form-control-sm"
                    style="width: 110px;"
                    :disabled="record.status === 'Absent'"
                  />
                </td>
                <td>
                  <input
                    v-model="record.notes"
                    type="text"
                    class="form-control form-control-sm"
                    style="width: 150px;"
                    placeholder="Optional note"
                  />
                </td>
                <td>
                  <div class="d-flex gap-1">
                    <button
                      class="btn btn-sm btn-success"
                      @click="updateStatus(record, 'Present')"
                      title="Mark Present">✅
                    </button>
                    <button
                      class="btn btn-sm btn-warning"
                      @click="updateStatus(record, 'Late')"
                      title="Mark Late">⏰
                    </button>
                    <button
                      class="btn btn-sm btn-danger"
                      @click="updateStatus(record, 'Absent')"
                      title="Mark Absent">❌
                    </button>
                  </div>
                </td>
              </tr>
              <tr v-if="filteredRecords.length === 0">
                <td colspan="6" class="text-center text-muted py-4">
                  No records found for this date.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
};
