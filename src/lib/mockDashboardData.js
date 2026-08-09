// TEMPORARY mock data.

export const mockUser = {
  name: "Sahitya",
  role: "User",
};

export const mockThreatOverview = [
  {
    id: "threats",
    label: "Threats Detected",
    value: 12,
    color: "red",
    sparkline: [4, 6, 5, 8, 7, 10, 12],
  },
  {
    id: "safe",
    label: "Safe Scans",
    value: 245,
    color: "green",
    sparkline: [180, 190, 200, 210, 225, 235, 245],
  },
  {
    id: "pending",
    label: "Pending Reports",
    value: 3,
    color: "amber",
    sparkline: [0, 1, 1, 2, 2, 3, 3],
  },
];

export const mockProtectionScore = 98;

export const mockRecentActivity = [
  {
    id: 1,
    type: "safe",
    title: "URL scan completed",
    subtitle: "google.com",
    time: "2m ago",
  },
  {
    id: 2,
    type: "warning",
    title: "Suspicious email detected",
    subtitle: "Amazon Invoice",
    time: "18m ago",
  },
  {
    id: 3,
    type: "info",
    title: "Message analysis completed",
    subtitle: "+91 98765 43210",
    time: "45m ago",
  },
  {
    id: 4,
    type: "safe",
    title: "URL scan completed",
    subtitle: "chat.openai.com",
    time: "1h ago",
  },
  {
    id: 5,
    type: "danger",
    title: "Dangerous URL detected",
    subtitle: "paypa1-login.net",
    time: "2h ago",
  },
];