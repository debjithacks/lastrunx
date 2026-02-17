import AdminLayout from '@/components/admin/AdminLayout'

export default function AdminMainLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return <AdminLayout>{children}</AdminLayout>;
}
