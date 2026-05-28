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
import { FaqPage } from '@/features/faq/FaqPage';
import { PlaceholderPage } from '@/features/placeholder/PlaceholderPage';
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
          <Route
            path="/org-chart"
            element={
              <PlaceholderPage title="Org Chart" description="Explore team structure and reporting lines." />
            }
          />
          <Route path="/faq" element={<FaqPage />} />
          <Route
            path="/chatbot"
            element={
              <PlaceholderPage title="AI Assistant" description="24/7 onboarding assistant for instant answers." />
            }
          />
          <Route element={<RoleRestrictedRoute path="/team-progress" />}>
            <Route
              path="/team-progress"
              element={
                <PlaceholderPage
                  title="Team Progress"
                  description="Track onboarding progress for your direct reports."
                />
              }
            />
          </Route>
          <Route element={<RoleRestrictedRoute path="/admin" />}>
            <Route
              path="/admin"
              element={
                <PlaceholderPage title="Admin" description="HR administrator tools and content management." />
              }
            />
          </Route>
          <Route element={<RoleRestrictedRoute path="/analytics" />}>
            <Route
              path="/analytics"
              element={
                <PlaceholderPage
                  title="Analytics"
                  description="Organization-wide onboarding metrics and compliance reporting."
                />
              }
            />
          </Route>
          <Route element={<RoleRestrictedRoute path="/provisioning" />}>
            <Route
              path="/provisioning"
              element={
                <PlaceholderPage
                  title="Provisioning Tasks"
                  description="IT onboarding tasks: accounts, hardware, and access requests."
                />
              }
            />
          </Route>
        </Route>
        </Route>
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
