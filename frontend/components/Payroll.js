const PayrollComponent = {
  data() {
    return {
      employees: [],
      loading: true,
      error: "",
      selectedEmployee: null,
      payslipMonth: new Date().toISOString().slice(0, 7),
      searchQuery: "",
    };
  },

  computed: {
    filteredEmployees() {
      return this.employees.filter(
        (emp) =>
          (emp.first_name + " " + emp.last_name)
            .toLowerCase()
            .includes(this.searchQuery.toLowerCase()) ||
          emp.department_name.toLowerCase().includes(this.searchQuery.toLowerCase()),
      );
    },
  },

  methods: {
    async loadEmployees() {
      this.loading = true;
      this.error = "";
      try {
        this.employees = await window.api.getEmployees();
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },

    // All salary calculations happen here
    calculatePayroll(salary) {
      const gross = Number(salary);
      const paye = Math.round(gross * 0.25);
      const uif = Math.round(gross * 0.01);
      const pension = Math.round(gross * 0.075);
      const totalDeductions = paye + uif + pension;
      const net = gross - totalDeductions;
      return { gross, paye, uif, pension, totalDeductions, net };
    },

    // Format as ZAR currency
    formatSalary(amount) {
      return "R " + Number(amount).toLocaleString("en-ZA");
    },

    // Open payslip for selected employee
    viewPayslip(emp) {
      this.selectedEmployee = emp;
    },

    // Close payslip
    closePayslip() {
      this.selectedEmployee = null;
    },

    // Format month display e.g. 2026-06 → June 2026
    formatMonth(month) {
      const [year, m] = month.split("-");
      const months = [
        "January", "February", "March", "April", "May", "June",
        "July", "August", "September", "October", "November", "December",
      ];
      return months[parseInt(m) - 1] + " " + year;
    },

    // Print the payslip
    printPayslip() {
      window.print();
    },
  },

  mounted() {
    this.loadEmployees();
  },

  template: `
    <div>
      <!-- PAGE HEADER -->
      <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
          <h3 class="mb-0">💰 Payroll</h3>
          <small class="text-muted">Monthly payroll management</small>
        </div>
        <div class="d-flex align-items-center gap-2">
          <label class="fw-semibold me-1">Pay Period:</label>
          <input
            v-model="payslipMonth"
            type="month"
            class="form-control"
            style="width: 180px;"
          />
        </div>
      </div>

      <div v-if="error" class="alert alert-danger">{{ error }}</div>
      <div v-if="loading" class="text-muted">Loading payroll data...</div>

      <template v-else>
        <!-- SUMMARY CARDS -->
        <div class="row g-3 mb-4">
          <div class="col-md-3">
            <div class="card text-white bg-primary shadow-sm">
              <div class="card-body">
                <div class="small">Total Employees</div>
                <div class="fs-4 fw-bold">{{ employees.length }}</div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-success shadow-sm">
              <div class="card-body">
                <div class="small">Total Gross Payroll</div>
                <div class="fs-5 fw-bold">
                  {{ formatSalary(employees.reduce((sum, e) =>
                    sum + Number(e.salary), 0)) }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-danger shadow-sm">
              <div class="card-body">
                <div class="small">Total Deductions</div>
                <div class="fs-5 fw-bold">
                  {{ formatSalary(employees.reduce((sum, e) =>
                    sum + calculatePayroll(e.salary).totalDeductions, 0)) }}
                </div>
              </div>
            </div>
          </div>
          <div class="col-md-3">
            <div class="card text-white bg-dark shadow-sm">
              <div class="card-body">
                <div class="small">Total Net Payroll</div>
                <div class="fs-5 fw-bold">
                  {{ formatSalary(employees.reduce((sum, e) =>
                    sum + calculatePayroll(e.salary).net, 0)) }}
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- SEARCH -->
        <div class="mb-3">
          <input
            v-model="searchQuery"
            type="text"
            class="form-control"
            placeholder="🔍 Search employee or department..."
          />
        </div>

        <!-- PAYROLL TABLE -->
        <div class="card shadow-sm mb-4">
          <div class="table-responsive">
            <table class="table table-hover mb-0">
              <thead class="table-dark">
                <tr>
                  <th>Employee</th>
                  <th>Department</th>
                  <th>Gross Salary</th>
                  <th>PAYE (25%)</th>
                  <th>UIF (1%)</th>
                  <th>Pension (7.5%)</th>
                  <th>Net Pay</th>
                  <th>Payslip</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="emp in filteredEmployees" :key="emp.id">
                  <td class="fw-semibold">{{ emp.first_name }} {{ emp.last_name }}</td>
                  <td>{{ emp.department_name }}</td>
                  <td>{{ formatSalary(calculatePayroll(emp.salary).gross) }}</td>
                  <td class="text-danger">
                    {{ formatSalary(calculatePayroll(emp.salary).paye) }}
                  </td>
                  <td class="text-danger">
                    {{ formatSalary(calculatePayroll(emp.salary).uif) }}
                  </td>
                  <td class="text-danger">
                    {{ formatSalary(calculatePayroll(emp.salary).pension) }}
                  </td>
                  <td class="text-success fw-bold">
                    {{ formatSalary(calculatePayroll(emp.salary).net) }}
                  </td>
                  <td>
                    <button
                      class="btn btn-sm btn-outline-primary"
                      @click="viewPayslip(emp)">
                      📄 View
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- PAYSLIP MODAL -->
        <div v-if="selectedEmployee" class="card shadow border-0 mt-2">
          <div class="card-header bg-dark text-white
            d-flex justify-content-between align-items-center">
            <span class="fw-bold">📄 Payslip — {{ selectedEmployee.first_name }} {{ selectedEmployee.last_name }}</span>
            <div class="d-flex gap-2">
              <button class="btn btn-sm btn-light" @click="printPayslip">
                🖨️ Print
              </button>
              <button class="btn btn-sm btn-outline-light"
                @click="closePayslip">✕ Close</button>
            </div>
          </div>
          <div class="card-body p-4" id="payslip-content">

            <!-- COMPANY HEADER -->
            <div class="text-center mb-4">
              <h4 class="fw-bold">ModernTech Solutions</h4>
              <p class="text-muted mb-0">123 Tech Park, Cape Town, 8001</p>
              <p class="text-muted">info@moderntech.co.za</p>
              <h5 class="mt-2">PAYSLIP —
                {{ formatMonth(payslipMonth).toUpperCase() }}</h5>
              <hr/>
            </div>

            <!-- EMPLOYEE INFO -->
            <div class="row mb-3">
              <div class="col-md-6">
                <p><strong>Employee Name:</strong>
                  {{ selectedEmployee.first_name }} {{ selectedEmployee.last_name }}</p>
                <p><strong>Position:</strong>
                  {{ selectedEmployee.job_title }}</p>
                <p><strong>Department:</strong>
                  {{ selectedEmployee.department_name }}</p>
              </div>
              <div class="col-md-6">
                <p><strong>Employee ID:</strong>
                  EMP-{{ String(selectedEmployee.id).padStart(4, '0') }}</p>
                <p><strong>Employment Type:</strong>
                  {{ selectedEmployee.employment_type }}</p>
                <p><strong>Pay Period:</strong>
                  {{ formatMonth(payslipMonth) }}</p>
              </div>
            </div>

            <hr/>

            <!-- EARNINGS AND DEDUCTIONS -->
            <div class="row">
              <div class="col-md-6">
                <h6 class="fw-bold text-success">EARNINGS</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td>Basic Salary</td>
                      <td class="text-end fw-semibold">
                        {{ formatSalary(
                          calculatePayroll(selectedEmployee.salary).gross) }}
                      </td>
                    </tr>
                    <tr class="table-success">
                      <td><strong>Total Earnings</strong></td>
                      <td class="text-end fw-bold">
                        {{ formatSalary(
                          calculatePayroll(selectedEmployee.salary).gross) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <div class="col-md-6">
                <h6 class="fw-bold text-danger">DEDUCTIONS</h6>
                <table class="table table-sm">
                  <tbody>
                    <tr>
                      <td>PAYE Tax (25%)</td>
                      <td class="text-end text-danger">
                        {{ formatSalary(
                          calculatePayroll(selectedEmployee.salary).paye) }}
                      </td>
                    </tr>
                    <tr>
                      <td>UIF (1%)</td>
                      <td class="text-end text-danger">
                        {{ formatSalary(
                          calculatePayroll(selectedEmployee.salary).uif) }}
                      </td>
                    </tr>
                    <tr>
                      <td>Pension Fund (7.5%)</td>
                      <td class="text-end text-danger">
                        {{ formatSalary(
                          calculatePayroll(selectedEmployee.salary).pension) }}
                      </td>
                    </tr>
                    <tr class="table-danger">
                      <td><strong>Total Deductions</strong></td>
                      <td class="text-end fw-bold text-danger">
                        {{ formatSalary(
                          calculatePayroll(selectedEmployee.salary)
                            .totalDeductions) }}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            <hr/>

            <!-- NET PAY -->
            <div class="alert alert-success text-center">
              <h5 class="mb-0">
                NET PAY:
                <strong>
                  {{ formatSalary(
                    calculatePayroll(selectedEmployee.salary).net) }}
                </strong>
              </h5>
            </div>

            <!-- ANNUAL BREAKDOWN -->
            <div class="mt-3">
              <h6 class="fw-bold">Annual Summary</h6>
              <div class="row g-2">
                <div class="col-md-4">
                  <div class="card bg-light text-center p-2">
                    <small class="text-muted">Annual Gross</small>
                    <div class="fw-bold">
                      {{ formatSalary(
                        calculatePayroll(selectedEmployee.salary).gross * 12) }}
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card bg-light text-center p-2">
                    <small class="text-muted">Annual Deductions</small>
                    <div class="fw-bold text-danger">
                      {{ formatSalary(
                        calculatePayroll(selectedEmployee.salary)
                          .totalDeductions * 12) }}
                    </div>
                  </div>
                </div>
                <div class="col-md-4">
                  <div class="card bg-light text-center p-2">
                    <small class="text-muted">Annual Net Pay</small>
                    <div class="fw-bold text-success">
                      {{ formatSalary(
                        calculatePayroll(selectedEmployee.salary).net * 12) }}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <p class="text-muted small mt-4 text-center">
              This is a system-generated payslip.
              ModernTech Solutions Confidential.
            </p>
          </div>
        </div>
      </template>

    </div>
  `,
};
