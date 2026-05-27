import { Navigate, Route, Routes } from 'react-router-dom';
import { AppShell } from '@/app/AppShell';
import { PlaceholderPage } from '@/features/placeholder/PlaceholderPage';
import { WelcomePage } from '@/features/welcome/WelcomePage';

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<WelcomePage />} />
      <Route element={<AppShell />}>
        <Route path="/dashboard" element={<PlaceholderPage title="Dashboard" description="Your personalized onboarding roadmap and timeline." />} />
        <Route path="/checklist" element={<PlaceholderPage title="Onboarding Checklist" description="Track and complete your onboarding tasks." />} />
        <Route path="/training" element={<PlaceholderPage title="Training" description="Required training videos and quizzes." />} />
        <Route path="/org-chart" element={<PlaceholderPage title="Org Chart" description="Explore team structure and reporting lines." />} />
        <Route path="/faq" element={<PlaceholderPage title="FAQ" description="Searchable knowledge base for common onboarding questions." />} />
        <Route path="/chatbot" element={<PlaceholderPage title="AI Assistant" description="24/7 onboarding assistant for instant answers." />} />
        <Route path="/admin" element={<PlaceholderPage title="Admin" description="HR administrator tools and content management." />} />
      </Route>
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
