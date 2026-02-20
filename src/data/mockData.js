export const AVATARS = [
  "https://images.unsplash.com/photo-1562228802-4b1052d0f845?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1672685667592-0392f458f46f?w=80&h=80&fit=crop&crop=face",
  "https://images.unsplash.com/photo-1576558656222-ba66febe3dec?w=80&h=80&fit=crop&crop=face",
  "https://images.pexels.com/photos/30004324/pexels-photo-30004324.jpeg?auto=compress&cs=tinysrgb&w=80&h=80&fit=crop",
];

export const users = [
  { id: "u1", name: "Alex Johnson", email: "admin@timepro.com", role: "admin", department: "IT", status: "active", joinDate: "2022-01-15", avatar: AVATARS[2] },
  { id: "u2", name: "Sarah Chen", email: "manager@timepro.com", role: "manager", department: "Engineering", status: "active", joinDate: "2021-06-01", avatar: AVATARS[1] },
  { id: "u3", name: "Mike Williams", email: "mike@timepro.com", role: "employee", department: "Engineering", status: "active", joinDate: "2023-03-20", avatar: AVATARS[0] },
  { id: "u4", name: "Emma Davis", email: "emma@timepro.com", role: "employee", department: "Design", status: "active", joinDate: "2023-07-10", avatar: AVATARS[3] },
  { id: "u5", name: "James Brown", email: "james@timepro.com", role: "employee", department: "Marketing", status: "inactive", joinDate: "2024-01-05", avatar: null },
  { id: "u6", name: "Lisa Martinez", email: "lisa@timepro.com", role: "manager", department: "Design", status: "active", joinDate: "2020-09-15", avatar: null },
];

export const projects = [
  { id: "p1", name: "Website Redesign", client: "TechCorp Inc.", status: "active", startDate: "2025-01-01", endDate: "2025-06-30", budget: 50000, spent: 18000, memberIds: ["u2", "u3", "u4"], description: "Complete redesign of corporate website with modern UI/UX", color: "#4F46E5" },
  { id: "p2", name: "Mobile App Development", client: "StartupXYZ", status: "active", startDate: "2025-02-01", endDate: "2025-09-30", budget: 120000, spent: 34000, memberIds: ["u2", "u3", "u5"], description: "Cross-platform mobile app for iOS and Android", color: "#0891B2" },
  { id: "p3", name: "Data Migration", client: "Enterprise Co.", status: "completed", startDate: "2024-10-01", endDate: "2025-01-31", budget: 30000, spent: 28500, memberIds: ["u2", "u4"], description: "Legacy data migration to cloud infrastructure", color: "#059669" },
  { id: "p4", name: "ERP Implementation", client: "Manufacturing Ltd.", status: "on-hold", startDate: "2025-03-01", endDate: "2025-12-31", budget: 200000, spent: 0, memberIds: ["u3", "u4", "u5"], description: "Full ERP system implementation and training", color: "#D97706" },
  { id: "p5", name: "API Integration", client: "FinTech Corp.", status: "active", startDate: "2025-02-10", endDate: "2025-05-10", budget: 45000, spent: 12000, memberIds: ["u2", "u3"], description: "Payment gateway and third-party API integrations", color: "#7C3AED" },
];

export const taskCategories = [
  { id: "t1", name: "Development", color: "#4F46E5", count: 45 },
  { id: "t2", name: "UI/UX Design", color: "#7C3AED", count: 28 },
  { id: "t3", name: "Testing & QA", color: "#059669", count: 32 },
  { id: "t4", name: "Meetings", color: "#D97706", count: 56 },
  { id: "t5", name: "Documentation", color: "#DC2626", count: 19 },
  { id: "t6", name: "Research", color: "#0891B2", count: 14 },
  { id: "t7", name: "Code Review", color: "#9333EA", count: 23 },
  { id: "t8", name: "Deployment", color: "#EA580C", count: 8 },
];

export const timesheets = [
  {
    id: "ts1", userId: "u3", weekStart: "2025-02-10", status: "submitted",
    submittedAt: "2025-02-14", remarks: "", totalHours: 40,
    entries: [
      { projectId: "p1", taskId: "t1", hours: [8, 8, 7, 8, 7, 0, 0] },
      { projectId: "p2", taskId: "t3", hours: [0, 0, 1, 0, 1, 0, 0] },
    ]
  },
  {
    id: "ts2", userId: "u4", weekStart: "2025-02-10", status: "approved",
    submittedAt: "2025-02-13", approvedAt: "2025-02-14", remarks: "Good work this week!", totalHours: 38,
    entries: [
      { projectId: "p1", taskId: "t2", hours: [8, 7, 8, 7, 8, 0, 0] },
      { projectId: "p3", taskId: "t5", hours: [0, 1, 0, 1, 0, 0, 0] },
    ]
  },
  {
    id: "ts3", userId: "u5", weekStart: "2025-02-10", status: "rejected",
    submittedAt: "2025-02-12", remarks: "Missing project codes for Monday. Please correct and resubmit.", totalHours: 32,
    entries: [
      { projectId: "p2", taskId: "t4", hours: [4, 8, 8, 8, 4, 0, 0] },
    ]
  },
  {
    id: "ts4", userId: "u3", weekStart: "2025-02-03", status: "approved",
    submittedAt: "2025-02-07", approvedAt: "2025-02-08", remarks: "Approved.", totalHours: 40,
    entries: [
      { projectId: "p1", taskId: "t1", hours: [8, 8, 8, 8, 8, 0, 0] },
    ]
  },
  {
    id: "ts5", userId: "u4", weekStart: "2025-02-03", status: "approved",
    submittedAt: "2025-02-06", approvedAt: "2025-02-07", remarks: "Looks good!", totalHours: 37,
    entries: [
      { projectId: "p1", taskId: "t2", hours: [7, 8, 7, 8, 7, 0, 0] },
    ]
  },
  {
    id: "ts6", userId: "u3", weekStart: "2025-02-17", status: "draft",
    totalHours: 16, remarks: "",
    entries: [
      { projectId: "p1", taskId: "t1", hours: [8, 8, 0, 0, 0, 0, 0] },
    ]
  },
];

export const monthlyData = [
  { month: "Sep", hours: 580 },
  { month: "Oct", hours: 620 },
  { month: "Nov", hours: 540 },
  { month: "Dec", hours: 480 },
  { month: "Jan", hours: 660 },
  { month: "Feb", hours: 340 },
];

export const employeeHoursData = [
  { name: "Mike W.", hours: 164, target: 176 },
  { name: "Emma D.", hours: 148, target: 176 },
  { name: "James B.", hours: 130, target: 176 },
  { name: "Sarah C.", hours: 156, target: 160 },
  { name: "Lisa M.", hours: 168, target: 160 },
];

export const projectUtilizationData = [
  { name: "Website Redesign", hours: 240, budget: 300 },
  { name: "Mobile App", hours: 380, budget: 500 },
  { name: "Data Migration", hours: 285, budget: 250 },
  { name: "ERP Impl.", hours: 0, budget: 800 },
  { name: "API Integration", hours: 120, budget: 200 },
];

export const tasks = [
  { id: "task1", categoryId: "t1", projectId: "p1", name: "Implement user authentication", priority: "high", estimate: 8, assignedTo: "u3", status: "completed" },
  { id: "task2", categoryId: "t2", projectId: "p1", name: "Design dashboard mockups", priority: "medium", estimate: 6, assignedTo: "u2", status: "in-progress" },
  { id: "task3", categoryId: "t3", projectId: "p2", name: "Write unit tests for API", priority: "high", estimate: 4, assignedTo: "u1", status: "pending" },
  { id: "task4", categoryId: "t4", projectId: "p2", name: "Sprint planning meeting", priority: "low", estimate: 2, assignedTo: "u3", status: "completed" },
  { id: "task5", categoryId: "t1", projectId: "p5", name: "API endpoint development", priority: "high", estimate: 12, assignedTo: "u3", status: "in-progress" },
  { id: "task6", categoryId: "t5", projectId: "p3", name: "Write migration guide", priority: "medium", estimate: 3, assignedTo: "u2", status: "pending" },
  { id: "task7", categoryId: "t7", projectId: "p1", name: "Code review - auth module", priority: "medium", estimate: 2, assignedTo: "u1", status: "completed" },
  { id: "task8", categoryId: "t8", projectId: "p5", name: "Deploy v2.1 to staging", priority: "high", estimate: 1, assignedTo: "u1", status: "pending" },
];

export const projectFiles = [
  { id: "f1", projectId: "p1", name: "Requirements_v1.pdf", type: "pdf", size: "2.4 MB", uploadedBy: "u2", uploadedAt: "2025-01-05" },
  { id: "f2", projectId: "p1", name: "Design_System_Assets.zip", type: "zip", size: "145 MB", uploadedBy: "u4", uploadedAt: "2025-01-12" },
  { id: "f3", projectId: "p1", name: "Meeting_Notes_Kickoff.docx", type: "doc", size: "15 KB", uploadedBy: "u2", uploadedAt: "2025-01-02" },
  { id: "f4", projectId: "p2", name: "App_Architecture_Diagram.png", type: "image", size: "4.2 MB", uploadedBy: "u3", uploadedAt: "2025-02-05" },
  { id: "f5", projectId: "p2", name: "API_Spec_Swagger.json", type: "code", size: "120 KB", uploadedBy: "u3", uploadedAt: "2025-02-10" },
  { id: "f6", projectId: "p3", name: "Legacy_DB_Schema.sql", type: "code", size: "45 KB", uploadedBy: "u2", uploadedAt: "2024-10-15" },
];

export const auditLogs = [
  { id: "log1", timestamp: "2025-02-17 14:30:22", user: "Alex Johnson", action: "USER_UPDATE", target: "user_id: 125", metadata: '{role: "Manager"}' },
  { id: "log2", timestamp: "2025-02-17 14:28:10", user: "Sarah Chen", action: "TS_APPROVE", target: "ts_id: 899", metadata: '{status: "Approved"}' },
  { id: "log3", timestamp: "2025-02-17 13:15:00", user: "System Worker", action: "DB_BACKUP", target: "daily_dump", metadata: '{size: "45MB"}' },
  { id: "log4", timestamp: "2025-02-17 11:02:33", user: "Mike Williams", action: "TS_SUBMIT", target: "ts_id: 901", metadata: '{hours: 38.5}' },
  { id: "log5", timestamp: "2025-02-16 09:45:21", user: "Sarah Chen", action: "PROJECT_UPDATE", target: "project: Beta", metadata: '{status: "In Progress"}' },
  { id: "log6", timestamp: "2025-02-15 16:20:05", user: "Alex Johnson", action: "ROLE_CHANGE", target: "user_id: u4", metadata: '{new_role: "employee"}' },
  { id: "log7", timestamp: "2025-02-15 10:30:00", user: "Mike Williams", action: "LOGIN", target: "system", metadata: '{ip: "192.168.1.10"}' },
  { id: "log8", timestamp: "2025-02-14 18:00:00", user: "System Worker", action: "CRON_JOB", target: "cleanup", metadata: '{files_removed: 12}' },
];

export const teamContributionData = [
  { name: "Mike", value: 21, color: "#4F46E5" },
  { name: "Lisa", value: 22, color: "#D97706" },
  { name: "Sarah", value: 20, color: "#059669" },
  { name: "James", value: 17, color: "#0891B2" },
  { name: "Emma", value: 19, color: "#7C3AED" },
];

export const projectEmployeeMatrix = [
  { name: "Website Redesign", alex: 45, jamie: 30, taylor: 20, total: 95 },
  { name: "Mobile App Dev", alex: 25, casey: 35, jordan: 10, total: 70 },
  { name: "Dashboard UI", jamie: 40, taylor: 20, jordan: 0, total: 60 },
];
