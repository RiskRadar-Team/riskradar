import DashboardLayout from "@/components/dashboard/DashboardLayout";
import Sidebar from "@/components/dashboard/Sidebar";

export default function Dashboard() {
  return (
    <DashboardLayout
      sidebar={<Sidebar />}
      navbar={<div />}
      rightPanel={<div />}
    >
      Main Content
    </DashboardLayout>
  );
}