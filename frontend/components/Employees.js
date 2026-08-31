const EmployeesComponent = {
  data() {
    return {
      employees: [],
      departments: [],
      loading: true,
      error: "",

      searchQuery: "",
      filterDepartment: "",
      selectedEmployee: null,

      showAddForm: false,
      editingId: null, // null = adding, otherwise the id being edited

      formError: "",
      saving: false,

      employeeForm: this.emptyForm(),
    };
  },

  computed: {
    // Filtering employees based on search and department filter
    filteredEmployees() {
      return this.employees.filter((emp) => {
        const fullName = emp.first_name + " " + emp.last_name;
        const matchesSearch =
          fullName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          emp.job_title.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
          emp.email.toLowerCase().includes(this.searchQuery.toLowerCase());
        const matchesDept =
          this.filterDepartment === "" ||
          emp.department_name === this.filterDepartment;
        return matchesSearch && matchesDept;
      });
    },

    departmentNames() {
      return [...new Set(this.employees.map((e) => e.department_name))].sort();
    },
  },

  methods: {
    emptyForm() {
      return {
        first_name: "",
        last_name: "",
        email: "",
        phone: "",
        job_title: "",
        department_id: "",
        employment_type: "Full-Time",
        hire_date: "",
        salary: "",
        hours_per_week: 40,
        status: "Active",
        address: "",
        emergency_contact: "",
      };
    },

    // Load employees and departments from the API
    async loadData() {
      this.loading = true;
      this.error = "";
      try {
        const [employees, departments] = await Promise.all([
          window.api.getEmployees(),
          window.api.getDepartments(),
        ]);
        this.employees = employees;
        this.departments = departments;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    // Detail panel for one employee
    viewEmployee(emp) {
      this.selectedEmployee = emp;
      this.showAddForm = false;
    },

    closeDetail() {
      this.selectedEmployee = null;
    },

    // Open the form to add a brand new employee
    openAddForm() {
      this.editingId = null;
      this.employeeForm = this.emptyForm();
      this.formError = "";
      this.showAddForm = true;
      this.selectedEmployee = null;
    },

    // Open the form pre-filled to edit an existing employee
    openEditForm(emp) {
      this.editingId = emp.id;
      this.employeeForm = {
        first_name: emp.first_name,
        last_name: emp.last_name,
        email: emp.email,
        phone: emp.phone || "",
        job_title: emp.job_title,
        department_id: emp.department_id,
        employment_type: emp.employment_type,
        hire_date: emp.hire_date ? emp.hire_date.slice(0, 10) : "",
        salary: emp.salary,
        hours_per_week: emp.hours_per_week,
        status: emp.status,
        address: emp.address || "",
        emergency_contact: emp.emergency_contact || "",
      };
      this.formError = "";
      this.showAddForm = true;
      this.selectedEmployee = null;
    },

    cancelForm() {
      this.showAddForm = false;
      this.editingId = null;
      this.formError = "";
    },

    // Saves a new employee OR updates an existing one, depending on editingId
    async saveEmployee() {
      this.formError = "";

      const required = ["first_name", "last_name", "email", "job_title", "department_id", "salary", "hire_date"];
      const missing = required.filter((field) => !this.employeeForm[field]);
      if (missing.length > 0) {
        this.formError = "Please fill in all required fields.";
        return;
      }

      this.saving = true;
      try {
        if (this.editingId) {
          await window.api.updateEmployee(this.editingId, this.employeeForm);
        } else {
          await window.api.createEmployee(this.employeeForm);
        }
        await this.loadData();
        this.showAddForm = false;
        this.editingId = null;
      } catch (err) {
        this.formError = err.message;
      } finally {
        this.saving = false;
      }
    },

    async removeEmployee(emp) {
      if (!confirm(`Delete ${emp.first_name} ${emp.last_name}? This cannot be undone.`)) {
        return;
      }
      try {
        await window.api.deleteEmployee(emp.id);
        this.selectedEmployee = null;
        await this.loadData();
      } catch (err) {
        alert(err.message);
      }
    },

    // Format salary as ZAR currency
    formatSalary(amount) {
      return "R " + Number(amount).toLocaleString("en-ZA");
    },

    // Badge colour based on status
    statusBadge(status) {
      if (status === "Active") return "badge bg-success";
      if (status === "On Leave") return "badge bg-warning text-dark";
      return "badge bg-secondary";
    },

    // MySQL returns full timestamps — trim to just the date part
    formatDate(dateStr) {
      if (!dateStr) return "";
      return dateStr.slice(0, 10);
    },

    // Calculate years of service
    yearsOfService(hireDate) {
      const start = new Date(hireDate);
      const now = new Date();
      const years = Math.floor((now - start) / (365.25 * 24 * 60 * 60 * 1000));
      return years + (years === 1 ? " year" : " years");
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
          <h3 class="mb-0">👥 Employees</h3>
          <small class="text-muted">{{ employees.length }} total employees</small>
        </div>
        <button class="btn btn-primary" @click="openAddForm">
          + Add Employee
        </button>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loading" class="text-muted">Loading employees...</div>

      <template v-else>
        <!-- ADD / EDIT EMPLOYEE FORM -->
        <div v-if="showAddForm" class="card mb-4 border-primary">
          <div class="card-header bg-primary text-white fw-bold">
            {{ editingId ? "Edit Employee" : "New Employee" }}
          </div>
          <div class="card-body">
            <div v-if="formError" class="alert alert-danger py-2">{{ formError }}</div>
            <div class="row g-3">
              <div class="col-md-6">
                <label class="form-label">First Name *</label>
                <input v-model="employeeForm.first_name" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Last Name *</label>
                <input v-model="employeeForm.last_name" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Email *</label>
                <input v-model="employeeForm.email" type="email" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Phone</label>
                <input v-model="employeeForm.phone" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Department *</label>
                <select v-model="employeeForm.department_id" class="form-select">
                  <option value="">Select department</option>
                  <option v-for="dept in departments" :key="dept.id" :value="dept.id">
                    {{ dept.name }}
                  </option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Job Title *</label>
                <input v-model="employeeForm.job_title" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Employment Type</label>
                <select v-model="employeeForm.employment_type" class="form-select">
                  <option>Full-Time</option>
                  <option>Part-Time</option>
                  <option>Contract</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Hire Date *</label>
                <input v-model="employeeForm.hire_date" type="date" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Monthly Salary (R) *</label>
                <input v-model="employeeForm.salary" type="number" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Status</label>
                <select v-model="employeeForm.status" class="form-select">
                  <option>Active</option>
                  <option>On Leave</option>
                  <option>Inactive</option>
                </select>
              </div>
              <div class="col-md-6">
                <label class="form-label">Address</label>
                <input v-model="employeeForm.address" type="text" class="form-control" />
              </div>
              <div class="col-md-6">
                <label class="form-label">Emergency Contact</label>
                <input v-model="employeeForm.emergency_contact" type="text" class="form-control" />
              </div>
            </div>
            <div class="mt-3 d-flex gap-2">
              <button class="btn btn-success" :disabled="saving" @click="saveEmployee">
                {{ saving ? "Saving..." : "✅ Save Employee" }}
              </button>
              <button class="btn btn-outline-secondary" @click="cancelForm">
                Cancel
              </button>
            </div>
          </div>
        </div>

        <!-- SEARCH AND FILTER BAR -->
        <div class="row mb-3 g-2">
          <div class="col-md-6">
            <input
              v-model="searchQuery"
              type="text"
              class="form-control"
              placeholder="🔍 Search by name, position or email..."
            />
          </div>
          <div class="col-md-4">
            <select v-model="filterDepartment" class="form-select">
              <option value="">All Departments</option>
              <option v-for="dept in departmentNames" :key="dept">{{ dept }}</option>
            </select>
          </div>
          <div class="col-md-2">
            <span class="form-control text-center bg-white text-muted">
              {{ filteredEmployees.length }} found
            </span>
          </div>
        </div>

        <!-- EMPLOYEE TABLE -->
        <div class="card shadow-sm">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-dark">
                <tr>
                  <th>#</th>
                  <th>Name</th>
                  <th>Department</th>
                  <th>Position</th>
                  <th>Type</th>
                  <th>Salary</th>
                  <th>Status</th>
                  <th>Action</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="emp in filteredEmployees" :key="emp.id">
                  <td>{{ emp.id }}</td>
                  <td class="fw-semibold">{{ emp.first_name }} {{ emp.last_name }}</td>
                  <td>{{ emp.department_name }}</td>
                  <td>{{ emp.job_title }}</td>
                  <td>{{ emp.employment_type }}</td>
                  <td>{{ formatSalary(emp.salary) }}</td>
                  <td>
                    <span :class="statusBadge(emp.status)">
                      {{ emp.status }}
                    </span>
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="viewEmployee(emp)">
                      View
                    </button>
                  </td>
                </tr>
                <tr v-if="filteredEmployees.length === 0">
                  <td colspan="8" class="text-center text-muted py-4">
                    No employees found.
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- EMPLOYEE DETAIL PANEL -->
        <div v-if="selectedEmployee" class="card mt-4 shadow border-0">
          <div class="card-header bg-dark text-white d-flex
            justify-content-between align-items-center">
            <span class="fw-bold">{{ selectedEmployee.first_name }} {{ selectedEmployee.last_name }}</span>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-outline-light" @click="openEditForm(selectedEmployee)">
                ✏️ Edit
              </button>
              <button class="btn btn-sm btn-outline-danger" @click="removeEmployee(selectedEmployee)">
                🗑️ Delete
              </button>
              <button class="btn btn-sm btn-outline-light" @click="closeDetail">✕ Close</button>
            </div>
          </div>
          <div class="card-body">
            <div class="row g-3">
              <div class="col-md-6">
                <p><strong>Email:</strong> {{ selectedEmployee.email }}</p>
                <p><strong>Phone:</strong> {{ selectedEmployee.phone }}</p>
                <p><strong>Address:</strong> {{ selectedEmployee.address }}</p>
                <p><strong>Emergency Contact:</strong>
                  {{ selectedEmployee.emergency_contact }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Department:</strong>
                  {{ selectedEmployee.department_name }} ({{ selectedEmployee.department_location }})</p>
                <p><strong>Position:</strong> {{ selectedEmployee.job_title }}</p>
                <p><strong>Employment Type:</strong>
                  {{ selectedEmployee.employment_type }}</p>
                <p><strong>Hire Date:</strong> {{ formatDate(selectedEmployee.hire_date) }}</p>
                <p><strong>Years of Service:</strong>
                  {{ yearsOfService(selectedEmployee.hire_date) }}</p>
                <p><strong>Monthly Salary:</strong>
                  {{ formatSalary(selectedEmployee.salary) }}</p>
                <p><strong>Annual Salary:</strong>
                  {{ formatSalary(selectedEmployee.salary * 12) }}</p>
                <p><strong>Status:</strong>
                  <span :class="statusBadge(selectedEmployee.status)">
                    {{ selectedEmployee.status }}
                  </span>
                </p>
              </div>
            </div>
          </div>
        </div>
      </template>

    </div>
  `,
};
