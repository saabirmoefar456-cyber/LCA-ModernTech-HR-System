const TimeOffComponent = {
  data() {
    return {
      employees: [],
      leaveRequests: [],
      loading: true,
      error: "",

      // New leave request form
      newRequest: {
        employee_id: "",
        type: "Annual Leave",
        start_date: "",
        end_date: "",
        reason: "",
      },
      formError: "",
      submitting: false,

      showForm: false,
      filterStatus: "",
      searchQuery: "",
    };
  },

  computed: {
    // Filter requests by status and search
    filteredRequests() {
      return this.leaveRequests.filter((req) => {
        const employeeName = req.first_name + " " + req.last_name;
        const matchesStatus =
          this.filterStatus === "" || req.status === this.filterStatus;
        const matchesSearch =
          employeeName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          req.type.toLowerCase().includes(this.searchQuery.toLowerCase());
        return matchesStatus && matchesSearch;
      });
    },

    // Count requests by status for summary cards
    pendingCount() {
      return this.leaveRequests.filter((r) => r.status === "Pending").length;
    },
    approvedCount() {
      return this.leaveRequests.filter((r) => r.status === "Approved").length;
    },
    deniedCount() {
      return this.leaveRequests.filter((r) => r.status === "Denied").length;
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

    // Calculate number of days between two dates
    calculateDays(start, end) {
      if (!start || !end) return 0;
      const startDate = new Date(start);
      const endDate = new Date(end);
      const diff = endDate - startDate;
      return Math.floor(diff / (1000 * 60 * 60 * 24)) + 1;
    },

    // Submit a new leave request
    async submitRequest() {
      this.formError = "";

      if (!this.newRequest.employee_id) this.formError = "Please select an employee";
      else if (!this.newRequest.start_date) this.formError = "Start date is required";
      else if (!this.newRequest.end_date) this.formError = "End date is required";
      else if (!this.newRequest.reason) this.formError = "Reason is required";
      else if (this.newRequest.end_date < this.newRequest.start_date)
        this.formError = "End date cannot be before start date";

      if (this.formError) return;

      this.submitting = true;
      try {
        await window.api.createTimeOffRequest(this.newRequest);
        await this.loadData();
        this.newRequest = {
          employee_id: "",
          type: "Annual Leave",
          start_date: "",
          end_date: "",
          reason: "",
        };
        this.showForm = false;
      } catch (err) {
        this.formError = err.message;
      } finally {
        this.submitting = false;
      }
    },

    // Approve a request
    async approveRequest(request) {
      try {
        await window.api.updateTimeOffStatus(request.id, "Approved");
        await this.loadData();
      } catch (err) {
        alert(err.message);
      }
    },

    // Deny a request
    async denyRequest(request) {
      try {
        await window.api.updateTimeOffStatus(request.id, "Denied");
        await this.loadData();
      } catch (err) {
        alert(err.message);
      }
    },

    // MySQL returns full timestamps — trim to just the date part
    formatDate(dateStr) {
      if (!dateStr) return "";
      return dateStr.slice(0, 10);
    },

    // Badge colour for status
    statusBadge(status) {
      if (status === "Approved") return "badge bg-success";
      if (status === "Pending") return "badge bg-warning text-dark";
      if (status === "Denied") return "badge bg-danger";
      return "badge bg-secondary";
    },

    // Badge colour for leave type
    typeBadge(type) {
      if (type === "Annual Leave") return "badge bg-primary";
      if (type === "Sick Leave") return "badge bg-info text-dark";
      if (type === "Family Responsibility") return "badge bg-secondary";
      return "badge bg-dark";
    },
  },

  mounted() {
    this.loadData();
  },

  template: `
    <div>
      <!-- PAGE HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="mb-0">🗓️ Time Off</h3>
          <small class="text-muted">
            Leave request management
          </small>
        </div>
        <button
          class="btn btn-primary"
          @click="showForm = !showForm">
          + New Request
        </button>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loading" class="text-muted">Loading leave requests...</div>

      <template v-else>
        <!-- SUMMARY CARDS -->
        <div class="row g-3 mb-4">
          <div class="col-md-4">
            <div class="card text-white bg-warning shadow-sm">
              <div class="card-body d-flex
                justify-content-between align-items-center">
                <div>
                  <div class="small">Pending</div>
                  <div class="fs-3 fw-bold">{{ pendingCount }}</div>
                </div>
                <div class="fs-1 opacity-50">⏳</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-white bg-success shadow-sm">
              <div class="card-body d-flex
                justify-content-between align-items-center">
                <div>
                  <div class="small">Approved</div>
                  <div class="fs-3 fw-bold">{{ approvedCount }}</div>
                </div>
                <div class="fs-1 opacity-50">✅</div>
              </div>
            </div>
          </div>
          <div class="col-md-4">
            <div class="card text-white bg-danger shadow-sm">
              <div class="card-body d-flex
                justify-content-between align-items-center">
                <div>
                  <div class="small">Denied</div>
                  <div class="fs-3 fw-bold">{{ deniedCount }}</div>
                </div>
                <div class="fs-1 opacity-50">❌</div>
              </div>
            </div>
          </div>
        </div>

        <!-- NEW REQUEST FORM -->
        <div v-if="showForm" class="card mb-4 border-primary">
          <div class="card-header bg-primary text-white fw-bold">
            New Leave Request
          </div>
          <div class="card-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">Employee *</label>
                <select
                  v-model="newRequest.employee_id"
                  class="form-select">
                  <option value="">Select employee</option>
                  <option
                    v-for="emp in employees"
                    :key="emp.id"
                    :value="emp.id">
                    {{ emp.first_name }} {{ emp.last_name }} — {{ emp.department_name }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Leave Type *</label>
                <select
                  v-model="newRequest.type"
                  class="form-select">
                  <option>Annual Leave</option>
                  <option>Sick Leave</option>
                  <option>Family Responsibility</option>
                  <option>Unpaid Leave</option>
                  <option>Study Leave</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Start Date *</label>
                <input
                  v-model="newRequest.start_date"
                  type="date"
                  class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">End Date *</label>
                <input
                  v-model="newRequest.end_date"
                  type="date"
                  class="form-control" />
              </div>

              <!-- Live day counter -->
              <div class="col-12" v-if="newRequest.start_date
                && newRequest.end_date">
                <div class="alert alert-info mb-0">
                  📅 Total days requested:
                  <strong>
                    {{ calculateDays(
                      newRequest.start_date,
                      newRequest.end_date) }} day(s)
                  </strong>
                </div>
              </div>

              <div class="col-12">
                <label class="form-label">Reason *</label>
                <textarea
                  v-model="newRequest.reason"
                  class="form-control"
                  rows="3"
                  placeholder="Briefly explain the reason for leave...">
                </textarea>
              </div>
            </div>
            <div class="mt-3 d-flex gap-2">
              <button
                class="btn btn-success"
                :disabled="submitting"
                @click="submitRequest">
                {{ submitting ? "Submitting..." : "✅ Submit Request" }}
              </button>
              <button
                class="btn btn-outline-secondary"
                @click="showForm = false">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- SEARCH AND FILTER -->
        <div class="row mb-3 g-2">
          <div class="col-md-6">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="🔍 Search by name or leave type..."
            />
          </div>
          <div class="col-md-4">
            <select v-model="filterStatus" class="form-select">
              <option value="">All Statuses</option>
              <option>Pending</option>
              <option>Approved</option>
              <option>Denied</option>
            </select>
          </div>
          <div class="col-md-2">
            <span class="form-control text-center bg-white text-muted">
              {{ filteredRequests.length }} requests
            </span>
          </div>
        </div>

        <!-- REQUESTS TABLE -->
        <div class="card shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-dark">
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Type</th>
                  <th>From</th>
                  <th>To</th>
                  <th>Reason</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr
                  v-for="req in filteredRequests"
                  :key="req.id">
                  <td class="fw-semibold">{{ req.first_name }} {{ req.last_name }}</td>
                  <td>{{ req.department_name }}</td>
                  <td>
                    <span :class="typeBadge(req.type)">
                      {{ req.type }}
                    </span>
                  </td>
                  <td>{{ formatDate(req.start_date) }}</td>
                  <td>{{ formatDate(req.end_date) }}</td>
                  <td>
                    <small class="text-muted">{{ req.reason }}</small>
                  </td>
                  <td>
                    <span :class="statusBadge(req.status)">
                      {{ req.status }}
                    </span>
                  </td>
                  <td>
                    <div class="d-flex gap-1">
                      <button
                        v-if="req.status === 'Pending'"
                        class="btn btn-sm btn-success"
                        @click="approveRequest(req)">
                        ✓
                      </button>
                      <button
                        v-if="req.status === 'Pending'"
                        class="btn btn-sm btn-danger"
                        @click="denyRequest(req)">
                        ✕
                      </button>
                      <span
                        v-if="req.status !== 'Pending'"
                        class="text-muted small">
                        —
                      </span>
                    </div>
                  </td>
                </tr>
                <tr v-if="filteredRequests.length === 0">
                  <td colspan="8"
                    class="text-center text-muted py-4">
                    No leave requests found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </template>

    </div>
  `,
};
