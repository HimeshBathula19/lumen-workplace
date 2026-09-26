import Sidebar from "../components/Sidebar";
import TopBar from "../components/TopBar";

export default function AppShell({ children }) {
  return (
    <div className="app-shell">
      <Sidebar />

      <main className="main-area">
        <TopBar />

        <div className="page-content">
          {children}
        </div>
      </main>
    </div>
  );
}