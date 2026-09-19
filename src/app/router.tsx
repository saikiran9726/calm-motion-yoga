import { createBrowserRouter } from 'react-router-dom';
import { AppShell } from './AppShell';
import { HomeScreen } from '@/features/home/HomeScreen';
import { ExploreScreen } from '@/features/explore/ExploreScreen';
import { ProgressScreen } from '@/features/progress/ProgressScreen';
import { ProfileScreen } from '@/features/profile/ProfileScreen';
import { ClinicDashboardScreen } from '@/features/clinic/ClinicDashboardScreen';
import { DesignSystemScreen } from '@/features/design/DesignSystemScreen';
import { LiveSessionScreen } from '@/features/session/LiveSessionScreen';
import { OnboardingScreen } from '@/features/onboarding/OnboardingScreen';
import { YogaPoseDetailScreen } from '@/features/yoga/YogaPoseDetailScreen';
import { MyRecoveryScreen } from '@/features/physio/MyRecoveryScreen';
import { AboutScreen } from '@/features/about/AboutScreen';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <AppShell />,
    children: [
      { index: true, element: <HomeScreen /> },
      { path: 'explore', element: <ExploreScreen /> },
      { path: 'progress', element: <ProgressScreen /> },
      { path: 'profile', element: <ProfileScreen /> },
      { path: 'therapist', element: <ClinicDashboardScreen /> },
      { path: 'clinic', element: <ClinicDashboardScreen /> },
      { path: 'about', element: <AboutScreen /> },
      { path: 'design', element: <DesignSystemScreen /> },
      { path: 'yoga/pose/:poseId', element: <YogaPoseDetailScreen /> },
      { path: 'physio/recovery', element: <MyRecoveryScreen /> },
    ],
  },
  {
    path: '/onboarding',
    element: <OnboardingScreen />,
  },
  {
    path: '/session',
    element: <LiveSessionScreen />,
  },
]);
