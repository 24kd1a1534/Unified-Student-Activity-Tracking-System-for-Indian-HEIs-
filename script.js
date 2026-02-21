    // Hardcoded initial dataset
    const initialStudentActivities = [
      {
        studentId: "S101",
        name: "Kishore",
        activity: "Hackathon",
        date: "2025-08-12",
        category: "Technical",
        status: "Approved",
        teacherRemarks: "Excellent teamwork",
        teacherId: "T001",
      },
      {
        studentId: "S102",
        name: "Sreeraj",
        activity: "AI Workshop",
        date: "2025-08-15",
        category: "Academic",
        status: "Approved",
        teacherRemarks: "",
        teacherId: "T001",
      },
      {
        studentId: "S103",
        name: "Surya",
        activity: "Football Tournament",
        date: "2025-07-20",
        category: "Sports",
        status: "Rejected",
        teacherRemarks: "Incomplete submission",
        teacherId: "T002",
      },
      {
        studentId: "S104",
        name: "Rohit",
        activity: "Drama Club",
        date: "2025-06-10",
        category: "Cultural",
        status: "Approved",
        teacherRemarks: "Great performance",
        teacherId: "T002",
      },
    ];

    // Simulated teacher IDs for filtering teacher's assigned activities
    const currentTeacherId = "T001";

    // LocalStorage key
    const STORAGE_KEY = "studentActivitiesData";

    // Current role state
    let currentRole = null; // Start as null for login
    let currentUsername = null;

    // Cached dataset in memory
    let studentActivities = [];

    // Utility: Save dataset to localStorage
    function saveData() {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(studentActivities));
    }

    // Utility: Load dataset from localStorage or initialize
    function loadData() {
      const data = localStorage.getItem(STORAGE_KEY);
      if (data) {
        try {
          studentActivities = JSON.parse(data);
        } catch {
          studentActivities = [...initialStudentActivities];
          saveData();
        }
      } else {
        studentActivities = [...initialStudentActivities];
        saveData();
      }
    }

    // Utility: Generate unique studentId for new students (simple increment)
    function generateStudentId() {
      let maxId = 100;
      studentActivities.forEach((rec) => {
        const num = parseInt(rec.studentId.replace(/\D/g, ""));
        if (num > maxId) maxId = num;
      });
      return "S" + (maxId + 1);
    }

    // Utility: Format date to readable string (e.g. Aug 12, 2025)
    function formatDate(dateStr) {
      const options = { year: "numeric", month: "short", day: "numeric" };
      const d = new Date(dateStr);
      if (isNaN(d)) return dateStr;
      return d.toLocaleDateString(undefined, options);
    }

    // Utility: Create status badge element HTML
    function createStatusBadge(status) {
      let className = "";
      switch (status) {
        case "Approved":
          className = "status-approved";
          break;
        case "Pending":
          className = "status-pending";
          break;
        case "Rejected":
          className = "status-rejected";
          break;
        default:
          className = "bg-secondary";
      }
      return `<span class="status-badge ${className}">${status}</span>`;
    }

    // Utility: Filter activities by search keyword (case-insensitive)
    function filterByKeyword(activities, keyword) {
      if (!keyword) return activities;
      keyword = keyword.toLowerCase();
      return activities.filter(
        (rec) =>
          rec.name.toLowerCase().includes(keyword) ||
          rec.activity.toLowerCase().includes(keyword) ||
          rec.category.toLowerCase().includes(keyword) ||
          rec.status.toLowerCase().includes(keyword) ||
          rec.teacherRemarks.toLowerCase().includes(keyword)
      );
    }

    // Utility: Reset form validation
    function resetFormValidation(form) {
      form.classList.remove("was-validated");
    }

    // Show login section
    function showLogin() {
      document.getElementById("dashboardSection").style.display = "none";
      document.getElementById("loginSection").style.display = "flex";
      currentRole = null;
      currentUsername = null;
    }

    // Logout
    function logout() {
      showLogin();
    }

    // Handle role login button
    function handleRoleLogin(role) {
      document.getElementById("roleName").textContent = role;
      const modal = new bootstrap.Modal(document.getElementById("loginModal"));
      modal.show();
      // Store attempted role
      document.getElementById("loginSubmitBtn").setAttribute("data-role", role);
    }

    // Handle login submission
    function handleLoginSubmit() {
      const role = document.getElementById("loginSubmitBtn").getAttribute("data-role");
      const username = document.getElementById("loginUsername").value.trim();
      const password = document.getElementById("loginPassword").value;

      // Simple simulation: Accept any non-empty username and password = "techslayers123"
      if (username && password === "techslayers123") {
        currentRole = role;
        currentUsername = username;
        document.getElementById("loginError").style.display = "none";
        bootstrap.Modal.getInstance(document.getElementById("loginModal")).hide();
        // Switch to dashboard
        document.getElementById("loginSection").style.display = "none";
        document.getElementById("dashboardSection").style.display = "block";
        switchRole(role);
        document.getElementById("currentUser").textContent = role + " (" + username + ")";
      } else {
        document.getElementById("loginError").style.display = "block";
      }
    }

    // Handle Student Add Activity Form Submission
    function handleAddActivityForm(event) {
      event.preventDefault();
      const form = event.target;

      // Remove previous validation
      resetFormValidation(form);

      if (!form.checkValidity()) {
        form.classList.add("was-validated");
        return;
      }

      // Get values
      const studentName = document.getElementById("studentName").value.trim();
      const activity = document.getElementById("activityName").value.trim();
      const date = document.getElementById("activityDate").value;
      const category = document.getElementById("activityCategory").value;
      const studentId = generateStudentId();

      // Create new record
      const newRecord = {
        studentId: studentId,
        name: studentName,
        activity: activity,
        date: date,
        category: category,
        status: "Pending",
        teacherRemarks: "",
        teacherId: currentTeacherId,
      };

      // Add to dataset
      studentActivities.push(newRecord);
      saveData();

      // Reset form
      form.reset();
      resetFormValidation(form);

      // Re-render dashboard
      renderStudentDashboard();

      // Show success message
      alert("Activity submitted successfully!");
    }

    // Render Student Dashboard Table
    function renderStudentDashboard() {
      if (currentRole !== "Student") return;
      const tbody = document.getElementById("studentActivityTableBody");
      const searchKeyword = document.getElementById("searchInput").value.trim();
      const studentNameInput = document.getElementById("studentName").value.trim();
      let filteredActivities = studentActivities;
      if (studentNameInput) {
        filteredActivities = filteredActivities.filter(
          (rec) => rec.name.toLowerCase() === studentNameInput.toLowerCase()
        );
      }
      filteredActivities = filterByKeyword(filteredActivities, searchKeyword);

      tbody.innerHTML = "";
      if (filteredActivities.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="5" class="text-center">No activities found.</td></tr>';
        renderStudentBadges([]);
        return;
      }
      filteredActivities.forEach((rec) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${rec.activity}</td>
          <td>${formatDate(rec.date)}</td>
          <td>${rec.category}</td>
          <td>${createStatusBadge(rec.status)}</td>
          <td>${rec.teacherRemarks || "-"}</td>
        `;
        tbody.appendChild(tr);
      });
      renderStudentBadges(filteredActivities);
    }

    // Render badges/certificates for student based on approved activities count
    function renderStudentBadges(activities) {
      const container = document.getElementById("studentBadges");
      container.innerHTML = "";
      if (!activities.length) return;

      const approvedCount = activities.filter(
        (rec) => rec.status === "Approved"
      ).length;

      if (approvedCount === 0) {
        container.innerHTML =
          '<span class="text-muted">No achievements earned yet.</span>';
        return;
      }

      // Simple badge logic: 1+ approved = Bronze, 3+ Silver, 5+ Gold
      const badges = [];
      if (approvedCount >= 1) {
        badges.push({
          name: "Bronze Achiever",
          color: "bg-secondary",
          icon: "🥉",
        });
      }
      if (approvedCount >= 3) {
        badges.push({
          name: "Silver Achiever",
          color: "bg-info",
          icon: "🥈",
        });
      }
      if (approvedCount >= 5) {
        badges.push({
          name: "Gold Achiever",
          color: "bg-warning text-dark",
          icon: "🥇",
        });
      }

      badges.forEach((badge) => {
        const span = document.createElement("span");
        span.className = `badge ${badge.color} me-2`;
        span.title = badge.name;
        span.textContent = `${badge.icon} ${badge.name}`;
        container.appendChild(span);
      });
    }

    // Render Teacher Dashboard Table
    function renderTeacherDashboard() {
      if (currentRole !== "Teacher") return;
      const tbody = document.getElementById("teacherActivityTableBody");
      const searchKeyword = document.getElementById("searchInput").value.trim();
      const studentFilter = document.getElementById("teacherFilterStudent").value.trim().toLowerCase();
      const categoryFilter = document.getElementById("teacherFilterCategory").value;
      const statusFilter = document.getElementById("teacherFilterStatus").value;

      let filteredActivities = studentActivities.filter(
        (rec) => rec.teacherId === currentTeacherId
      );

      filteredActivities = filterByKeyword(filteredActivities, searchKeyword);

      if (studentFilter) {
        filteredActivities = filteredActivities.filter((rec) =>
          rec.name.toLowerCase().includes(studentFilter)
        );
      }
      if (categoryFilter) {
        filteredActivities = filteredActivities.filter(
          (rec) => rec.category === categoryFilter
        );
      }
      if (statusFilter) {
        filteredActivities = filteredActivities.filter(
          (rec) => rec.status === statusFilter
        );
      }

      tbody.innerHTML = "";
      if (filteredActivities.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="6" class="text-center">No activities found.</td></tr>';
        return;
      }

      filteredActivities.forEach((rec) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${rec.name}</td>
          <td>${rec.activity}</td>
          <td>${formatDate(rec.date)}</td>
          <td>${rec.category}</td>
          <td>${createStatusBadge(rec.status)}</td>
          <td><input type="text" class="form-control remarks-input" data-student-id="${rec.studentId}" placeholder="Add remarks..." value="${rec.teacherRemarks}" /></td>
        `;
        tbody.appendChild(tr);
      });

      updateRemarksListeners(tbody);
    }

    // Update remarks on input change (debounced)
    function updateRemarksListeners(container) {
      const inputs = container.querySelectorAll(".remarks-input");
      let debounceTimer;
      inputs.forEach((input) => {
        input.addEventListener("input", () => {
          clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            const studentId = input.getAttribute("data-student-id");
            const remarks = input.value;
            const record = studentActivities.find(
              (rec) => rec.studentId === studentId
            );
            if (record) {
              record.teacherRemarks = remarks;
              saveData();
            }
          }, 500);
        });
      });
    }

    // Render Admin Dashboard Table
    function renderAdminDashboard() {
      if (currentRole !== "Admin") return;
      const tbody = document.getElementById("adminActivityTableBody");
      const searchKeyword = document.getElementById("searchInput").value.trim();
      const statusFilter = document.getElementById("adminFilterStatus").value;
      const categoryFilter = document.getElementById("adminFilterCategory").value;
      const dateFilter = document.getElementById("adminFilterDate").value.trim();

      let filteredActivities = filterByKeyword(studentActivities, searchKeyword);

      if (statusFilter) {
        filteredActivities = filteredActivities.filter(
          (rec) => rec.status === statusFilter
        );
      }
      if (categoryFilter) {
        filteredActivities = filteredActivities.filter(
          (rec) => rec.category === categoryFilter
        );
      }
      if (dateFilter) {
        filteredActivities = filteredActivities.filter(
          (rec) => rec.date === dateFilter
        );
      }

      tbody.innerHTML = "";
      if (filteredActivities.length === 0) {
        tbody.innerHTML =
          '<tr><td colspan="7" class="text-center">No activities found.</td></tr>';
        return;
      }

      filteredActivities.forEach((rec) => {
        const tr = document.createElement("tr");
        tr.innerHTML = `
          <td>${rec.name}</td>
          <td>${rec.activity}</td>
          <td>${formatDate(rec.date)}</td>
          <td>${rec.category}</td>
          <td>${createStatusBadge(rec.status)}</td>
          <td>${rec.teacherRemarks || "-"}</td>
          <td>
            <button class="btn btn-success btn-sm me-2 action-btn" data-action="approve" data-student-id="${rec.studentId}">Approve</button>
            <button class="btn btn-danger btn-sm action-btn" data-action="reject" data-student-id="${rec.studentId}">Reject</button>
          </td>
        `;
        tbody.appendChild(tr);
      });

      updateActionListeners(tbody);
    }

    // Update action listeners for approve/reject buttons
    function updateActionListeners(container) {
      const buttons = container.querySelectorAll(".action-btn");
      buttons.forEach((btn) => {
        btn.addEventListener("click", (e) => {
          const action = e.target.getAttribute("data-action");
          const studentId = e.target.getAttribute("data-student-id");
          const record = studentActivities.find(
            (rec) => rec.studentId === studentId
          );
          if (!record) return;

          record.status = action === "approve" ? "Approved" : "Rejected";
          saveData();
          renderAllDashboards();
        });
      });
    }

    // Render all dashboards
    function renderAllDashboards() {
      renderStudentDashboard();
      renderTeacherDashboard();
      renderAdminDashboard();
    }

    // Switch role and dashboard
    function switchRole(role) {
      currentRole = role;
      document
        .querySelectorAll(".role-dashboard")
        .forEach((div) => (div.style.display = "none"));
      document.getElementById(`${role.toLowerCase()}Dashboard`).style.display = "block";
      renderAllDashboards();
    }

    // Initialize on page load
    document.addEventListener("DOMContentLoaded", () => {
      loadData();
      showLogin(); // Start with login

      // Event listeners for login
      document.getElementById("studentLoginBtn").addEventListener("click", () => handleRoleLogin("Student"));
      document.getElementById("teacherLoginBtn").addEventListener("click", () => handleRoleLogin("Teacher"));
      document.getElementById("adminLoginBtn").addEventListener("click", () => handleRoleLogin("Admin"));
      document.getElementById("loginSubmitBtn").addEventListener("click", handleLoginSubmit);

      // Other event listeners
      document.getElementById("addActivityForm").addEventListener("submit", handleAddActivityForm);

      // Search input with debounce
      let searchTimer;
      document.getElementById("searchInput").addEventListener("input", () => {
        clearTimeout(searchTimer);
        searchTimer = setTimeout(renderAllDashboards, 300);
      });

      // Teacher filters
      document.getElementById("teacherFilterStudent").addEventListener("input", renderTeacherDashboard);
      document.getElementById("teacherFilterCategory").addEventListener("change", renderTeacherDashboard);
      document.getElementById("teacherFilterStatus").addEventListener("change", renderTeacherDashboard);
      document.getElementById("teacherClearFilters").addEventListener("click", () => {
        document.getElementById("teacherFilterStudent").value = "";
        document.getElementById("teacherFilterCategory").value = "";
        document.getElementById("teacherFilterStatus").value = "";
        renderTeacherDashboard();
      });

      // Admin filters
      document.getElementById("adminFilterStatus").addEventListener("change", renderAdminDashboard);
      document.getElementById("adminFilterCategory").addEventListener("change", renderAdminDashboard);
      document.getElementById("adminFilterDate").addEventListener("input", renderAdminDashboard);
      document.getElementById("adminClearFilters").addEventListener("click", () => {
        document.getElementById("adminFilterStatus").value = "";
        document.getElementById("adminFilterCategory").value = "";
        document.getElementById("adminFilterDate").value = "";
        renderAdminDashboard();
      });

      // Student name input for filtering
      document.getElementById("studentName").addEventListener("input", renderStudentDashboard);
    });
  