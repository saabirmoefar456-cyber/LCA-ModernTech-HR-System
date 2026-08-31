const LoginComponent = {
  data() {
    return {
      email: "",
      password: "",
      error: "",
      loading: false,
    };
  },

  methods: {
    async handleLogin() {
      this.error = "";

      if (!this.email || !this.password) {
        this.error = "Please enter both email and password.";
        return;
      }

      this.loading = true;
      try {
        const user = await window.api.login(this.email, this.password);
        this.$emit("logged-in", user);
      } catch (err) {
        this.error = err.message;
      } finally {
        this.loading = false;
      }
    },
  },

  template: `
    <div class="d-flex align-items-center justify-content-center"
      style="min-height: 100vh; background: #1a1d29;">
      <div class="card shadow-lg border-0" style="width: 400px;">
        <div class="card-body p-4">
          <div class="text-center mb-4">
            <h4 class="fw-bold mb-0">🏢 ModernTech Solutions</h4>
            <small class="text-muted">HR System Login</small>
          </div>

          <div v-if="error" class="alert alert-danger py-2">
            {{ error }}
          </div>

          <form @submit.prevent="handleLogin">
            <div class="mb-3">
              <label class="form-label">Email</label>
              <input
                v-model="email"
                type="email"
                class="form-control"
                placeholder="you@moderntech.co.za"
                :disabled="loading"
              />
            </div>
            <div class="mb-3">
              <label class="form-label">Password</label>
              <input
                v-model="password"
                type="password"
                class="form-control"
                placeholder="Password"
                :disabled="loading"
              />
            </div>
            <button
              type="submit"
              class="btn btn-primary w-100"
              :disabled="loading"
            >
              {{ loading ? "Logging in..." : "Log In" }}
            </button>
          </form>
        </div>
      </div>
    </div>
  `,
};
