import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from '@/components/ui/toaster';
import { TooltipProvider } from '@/components/ui/tooltip';
import NotFound from '@/pages/not-found';
import { Route, Switch, Router as WouterRouter } from 'wouter';
import { ThemeProvider } from '@/components/theme-provider';
import { SidebarProvider } from '@/components/layout/sidebar-context';

import { PublicLayout } from '@/components/layout/public-layout';
import { DashboardLayout } from '@/components/layout/dashboard-layout';
import { AdminLayout } from '@/components/layout/admin-layout';

// Public Pages
import HomePage from '@/pages/public/home';
import RankTrackerPage from '@/pages/public/rank-tracker';
import ServicesPage from '@/pages/public/services';
import PricingPage from '@/pages/public/pricing';
import CaseStudiesPage from '@/pages/public/case-studies';
import HowItWorksPage from '@/pages/public/how-it-works';
import AboutPage from '@/pages/public/about';
import FaqPage from '@/pages/public/faq';
import BlogPage from '@/pages/public/blog';
import BlogPostPage from '@/pages/public/blog-post';
import ContactPage from '@/pages/public/contact';

// Auth Pages
import LoginPage from '@/pages/auth/login';
import RegisterPage from '@/pages/auth/register';
import ForgotPasswordPage from '@/pages/auth/forgot-password';

// Dashboard Pages
import DashboardOverview from '@/pages/dashboard/overview';
import DashboardProjects from '@/pages/dashboard/projects';
import DashboardOrders from '@/pages/dashboard/orders';
import DashboardInvoices from '@/pages/dashboard/invoices';
import DashboardTickets from '@/pages/dashboard/tickets';
import DashboardMessages from '@/pages/dashboard/messages';
import DashboardReports from '@/pages/dashboard/reports';

// Admin Pages
import AdminOverview from '@/pages/admin/overview';
import AdminClients from '@/pages/admin/clients';
import AdminOrders from '@/pages/admin/orders';
import AdminTickets from '@/pages/admin/tickets';
import AdminBlog from '@/pages/admin/blog';
import AdminTestimonials from '@/pages/admin/testimonials';
import AdminFaq from '@/pages/admin/faq';
import AdminContacts from '@/pages/admin/contacts';
import AdminReports from '@/pages/admin/reports';
import AdminSubscribers from '@/pages/admin/subscribers';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function Router() {
  return (
    <Switch>
      {/* Auth Routes */}
      <Route path="/login" component={LoginPage} />
      <Route path="/register" component={RegisterPage} />
      <Route path="/forgot-password" component={ForgotPasswordPage} />

      {/* Admin Routes */}
      <Route path="/admin*">
        <SidebarProvider>
          <AdminLayout>
            <Switch>
              <Route path="/admin" component={AdminOverview} />
              <Route path="/admin/clients" component={AdminClients} />
              <Route path="/admin/orders" component={AdminOrders} />
              <Route path="/admin/tickets" component={AdminTickets} />
              <Route path="/admin/blog" component={AdminBlog} />
              <Route path="/admin/testimonials" component={AdminTestimonials} />
              <Route path="/admin/faq" component={AdminFaq} />
              <Route path="/admin/reports" component={AdminReports} />
              <Route path="/admin/contacts" component={AdminContacts} />
              <Route path="/admin/subscribers" component={AdminSubscribers} />
              <Route component={NotFound} />
            </Switch>
          </AdminLayout>
        </SidebarProvider>
      </Route>

      {/* Dashboard Routes */}
      <Route path="/dashboard*">
        <SidebarProvider>
          <DashboardLayout>
            <Switch>
              <Route path="/dashboard" component={DashboardOverview} />
              <Route path="/dashboard/projects" component={DashboardProjects} />
              <Route path="/dashboard/orders" component={DashboardOrders} />
              <Route path="/dashboard/invoices" component={DashboardInvoices} />
              <Route path="/dashboard/tickets" component={DashboardTickets} />
              <Route path="/dashboard/messages" component={DashboardMessages} />
              <Route path="/dashboard/reports" component={DashboardReports} />
              <Route component={NotFound} />
            </Switch>
          </DashboardLayout>
        </SidebarProvider>
      </Route>

      {/* Public Routes */}
      <Route>
        <PublicLayout>
          <Switch>
            <Route path="/" component={HomePage} />
            <Route path="/rank-tracker" component={RankTrackerPage} />
            <Route path="/services" component={ServicesPage} />
            <Route path="/pricing" component={PricingPage} />
            <Route path="/case-studies" component={CaseStudiesPage} />
            <Route path="/how-it-works" component={HowItWorksPage} />
            <Route path="/about" component={AboutPage} />
            <Route path="/faq" component={FaqPage} />
            <Route path="/blog" component={BlogPage} />
            <Route path="/blog/:slug" component={BlogPostPage} />
            <Route path="/contact" component={ContactPage} />
            <Route component={NotFound} />
          </Switch>
        </PublicLayout>
      </Route>
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="light" storageKey="numverify-theme">
        <TooltipProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, '')}>
            <Router />
          </WouterRouter>
          <Toaster />
        </TooltipProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
