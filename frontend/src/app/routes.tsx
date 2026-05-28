import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { ForbiddenPage } from '@/features/auth/ForbiddenPage';
import { ForgotPasswordPage } from '@/features/auth/ForgotPasswordPage';
import { LoginPage } from '@/features/auth/LoginPage';
import { ProtectedRoute, PublicAuthRoute } from '@/features/auth/ProtectedRoute';
import { ResetPasswordPage } from '@/features/auth/ResetPasswordPage';
import { RoleRestrictedRoute } from '@/features/auth/RoleRestrictedRoute';
import { SignupPage } from '@/features/auth/SignupPage';
import { PlaceholderPage } from '@/features/placeholder/PlaceholderPage';
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
        <Route path="/forbidden" element={<ForbiddenPage />} />
        <Route element={<AppShell />}>
          <Route
            path="/dashboard"
            element={
              <PlaceholderPage
                title="Dashboard"
                description="Your personalized onboarding roadmap and timeline."
              />
            }
          />
          <Route
            path="/checklist"
            element={
              <PlaceholderPage
                title="Onboarding Checklist"
                description="Track and complete your onboarding tasks."
              />
            }
          />
          <Route
            path="/training"
            element={
              <PlaceholderPage title="Training" description="Required training videos and quizzes." />
            }
          />
          <Route
            path="/org-chart"
            element={
              <PlaceholderPage title="Org Chart" description="Explore team structure and reporting lines." />
            }
          />
          <Route
            path="/faq"
            element={
              <PlaceholderPage
                title="FAQ"
                description="Searchable knowledge base for common onboarding questions."
              />
            }
          />
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
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
