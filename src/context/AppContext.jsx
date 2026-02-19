import { createContext, useContext, useState } from "react";
import { users as initialUsers, projects as initialProjects, timesheets as initialTimesheets, tasks as initialTasks, projectFiles as initialFiles } from "@/data/mockData";

const AppContext = createContext();

export function AppProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [allUsers, setAllUsers] = useState(initialUsers);
  const [projects, setProjects] = useState(initialProjects);
  const [timesheets, setTimesheets] = useState(initialTimesheets);
  const [tasks, setTasks] = useState(initialTasks);
  const [files, setFiles] = useState(initialFiles);

  const login = (userId) => {
    const user = initialUsers.find((u) => u.id === userId);
    setCurrentUser(user || null);
  };

  const logout = () => setCurrentUser(null);

  const submitTimesheet = (timesheetId) => {
    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === timesheetId ? { ...t, status: "submitted", submittedAt: new Date().toISOString() } : t
      )
    );
  };

  const approveTimesheet = (timesheetId, remarks) => {
    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === timesheetId ? { ...t, status: "approved", remarks, approvedAt: new Date().toISOString() } : t
      )
    );
  };

  const rejectTimesheet = (timesheetId, remarks) => {
    setTimesheets((prev) =>
      prev.map((t) =>
        t.id === timesheetId ? { ...t, status: "rejected", remarks } : t
      )
    );
  };

  const addProject = (project) => {
    setProjects((prev) => [...prev, { ...project, id: `p${Date.now()}`, spent: 0 }]);
  };

  const addUser = (user) => {
    setAllUsers((prev) => [...prev, { ...user, id: `u${Date.now()}`, status: "active" }]);
  };

  const addTask = (task) => {
    setTasks((prev) => [...prev, { ...task, id: `task${Date.now()}` }]);
  };

  const addFile = (file) => {
    setFiles((prev) => [...prev, { ...file, id: `f${Date.now()}`, uploadedAt: new Date().toISOString() }]);
  };

  const updateTaskStatus = (taskId, status) => {
    setTasks((prev) => prev.map((t) => (t.id === taskId ? { ...t, status } : t)));
  };

  const updateUserStatus = (userId, status) => {
    setAllUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, status } : u)));
  };

  const saveTimesheetEntries = (timesheetId, entries, totalHours) => {
    setTimesheets((prev) => {
      const exists = prev.find((t) => t.id === timesheetId);
      if (exists) {
        return prev.map((t) => (t.id === timesheetId ? { ...t, entries, totalHours } : t));
      }
      return [...prev, { id: timesheetId, userId: currentUser?.id, status: "draft", entries, totalHours }];
    });
  };

  const updateProject = (updatedProject) => {
    setProjects((prev) => prev.map((p) => (p.id === updatedProject.id ? updatedProject : p)));
  };

  const updateUser = (updatedUser) => {
    setAllUsers((prev) => prev.map((u) => (u.id === updatedUser.id ? updatedUser : u)));
  };

  const removeUser = (userId) => {
    setAllUsers((prev) => prev.filter((u) => u.id !== userId));
  };

  return (
    <AppContext.Provider
      value={{
        currentUser, login, logout,
        allUsers, setAllUsers, addUser, updateUserStatus, updateUser, removeUser,
        projects, setProjects, addProject, updateProject,
        tasks, setTasks, addTask, updateTaskStatus,
        timesheets, setTimesheets, submitTimesheet, approveTimesheet, rejectTimesheet, saveTimesheetEntries,
        files, setFiles, addFile
      }}
    >
      {children}
    </AppContext.Provider>
  );
}

export const useApp = () => useContext(AppContext);
