import TimetableManager from '@/components/admin/academic/TimetableManager';

export const metadata = {
  title: 'Class Timetable | MISC Admin',
  description: 'Manage class timetables, daily period schedules, subject allocations, and faculty assignments.',
};

export default function AdminTimetablePage() {
  return <TimetableManager standalone={true} />;
}
