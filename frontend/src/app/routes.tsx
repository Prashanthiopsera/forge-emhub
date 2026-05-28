import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { ForbiddenPage } from '@/features/auth/ForbiddenPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProtectedRoute, PublicAuthRoute } from '@/features/auth/ProtectedRoute';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { RoleRestrictedRoute } from '@/features/auth/RoleRestrictedRoute';
import { SignupPage } from '@/features/auth/SignupPage';
import { MfaEnrollPage } from '@/features/auth/mfa/MfaEnrollPage';
import { MfaGate } from '@/features/auth/mfa/MfaGate';
import { MfaVerifyPage } from '@/features/auth/mfa/MfaVerifyPage';
import { ChecklistPage } from '@/features/checklist/ChecklistPage';
import { DashboardPage } from '@/features/dashboard/DashboardPage';
import { AnalyticsPage } from '@/features/analytics/AnalyticsPage';
import { AdminPage } from '@/features/admin/AdminPage';
import { AuditPage } from '@/features/audit/AuditPage';
import { OffboardPage } from '@/features/offboard/OffboardPage';
import { NewHirePage } from '@/features/new-hire/NewHirePage';
import { TrainingAdminPage } from '@/features/training-admin/TrainingAdminPage';
import { ChatbotPage } from '@/features/chatbot/ChatbotPage';
import { EscalationsPage } from '@/features/escalations/EscalationsPage';
import { FaqAdminPage } from '@/features/faq-admin/FaqAdminPage';
import { FaqPage } from '@/features/faq/FaqPage';
import { ManagerDashboardPage } from '@/features/manager/ManagerDashboardPage';
import { PlaceholderPage } from '@/features/placeholder/PlaceholderPage';
import { TemplateManagementPage } from '@/features/templates/TemplateManagementPage';
import { ProvisioningPage } from '@/features/provisioning/ProvisioningPage';
import { OrgChartPage } from '@/features/org-chart/OrgChartPage';
import { QuizPage } from '@/features/training/QuizPage';
import { TrainingCatalogPage } from '@/features/training/TrainingCatalogPage';
import { WelcomePage } from '@/features/welcome/WelcomePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route
        path="/login"
        element={
          <PublicAuthRoute>
            <LoginPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/signup"
        element={
          <PublicAuthRoute>
            <SignupPage />
          </PublicAuthRoute>
        }
      />
      <Route
        path="/forgot-password"
        element={
          <PublicAuthRoute>
            <ForgotPasswordPage />
          </PublicAuthRoute>
        }
      />
      <Route path="/reset-password" element={<ResetPasswordPage />} />
      <Route element={<ProtectedRoute />}>
        <Route path="/mfa/enroll" element={<MfaEnrollPage />} />
        <Route path="/mfa/verify" element={<MfaVerifyPage />} />
        <Route element={<MfaGate />}>
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route element={<AppShell />}>
          <Route path="/dashboard" element={<DashboardPage />} />
          <Route path="/checklist" element={<ChecklistPage />} />
          <Route path="/training" element={<TrainingCatalogPage />} />
          <Route path="/org-chart" element={<OrgChartPage />} />
          <Route path="/training/:moduleId/quiz" element={<QuizPage />} />
          <Route path="/faq" element={<FaqPage />} />
          <Route path="/chatbot" element={<ChatbotPage />} />
          <Route element={<RoleRestrictedRoute path="/team-progress" />}>
            <Route path="/team-progress" element={<ManagerDashboardPage />} />
          </Route>
          <Route element={<RoleRestrictedRoute path="/admin" />}>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/admin/training" element={<TrainingAdminPage />} />
            <Route path="/admin/new-hire" element={<NewHirePage />} />
            <Route path="/admin/templates" element={<TemplateManagementPage />} />
            <Route path="/admin/faq" element={<FaqAdminPage />} />
            <Route path="/admin/escalations" element={<EscalationsPage />} />
            <Route path="/admin/audit" element={<AuditPage />} />
            <Route path="/admin/offboard" element={<OffboardPage />} />
          </Route>
          <Route element={<RoleRestrictedRoute path="/analytics" />}>
            <Route path="/analytics" element={<AnalyticsPage />} />
          </Route>
          <Route element={<RoleRestrictedRoute path="/provisioning" />}>
            <Route path="/provisioning" element={<ProvisioningPage />} />
          </Route>
        </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
