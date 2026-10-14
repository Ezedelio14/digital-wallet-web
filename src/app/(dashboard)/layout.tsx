import { Sidebar } from "@/components/shared/sidebar";
import { MobileHeader } from "@/components/shared/mobile-header";

export default function DashboardLayout({ children }: LayoutProps<"/">) {
  return (
    <div className="relative min-h-dvh">
      {/* Ambient background glow */}
      <div aria-hidden className="pointer-events-none fixed inset-0 -z-10 overflow-hidden">
        <div className="absolute -top-40 left-1/3 size-[36rem] rounded-full bg-primary/[0.07] blur-[120px]" />
        <div className="absolute right-0 bottom-0 size-[28rem] rounded-full bg-[oklch(0.7_0.14_200)]/[0.05] blur-[120px]" />
      </div>

      <Sidebar />
      <div className="lg:pl-64">
        <MobileHeader />
        <main className="mx-auto w-full max-w-6xl px-4 py-8 sm:px-6 lg:px-10 lg:py-10">
          {children}
        </main>
      </div>
    </div>
  );
}
