'use client';

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  // Add CSS to hide sidebar for auth pages
  return (
    <div className="auth-page">
      {children}
    </div>
  );
}