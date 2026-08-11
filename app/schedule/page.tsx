import { BottomNav } from "@/components/bottom-nav";

export default function SchedulePage() {
  return (
    <main className="shell">
      <header className="header"><div className="brand">Schedule</div></header>
      <section className="hero"><h1>予定だけ、シンプルに。</h1><p>出勤・来店予定・誕生日・NG時間など。</p></section>
      <div className="card empty">予定はまだありません</div>
      <BottomNav />
    </main>
  );
}
