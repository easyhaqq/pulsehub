export default function PrivacyPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <span className="category-badge mb-4 inline-block">Legal</span>
      <h1 className="text-4xl font-extrabold text-[#0F172A] mb-6">Privacy Policy</h1>
      <div className="prose-article space-y-6 text-slate-600">
        <p>PulseHub is committed to protecting your privacy. This policy explains what data we collect and how we use it.</p>
        <h2>Data We Collect</h2>
        <p>We collect only the information necessary to provide our service, including email addresses for newsletter subscriptions and basic analytics data.</p>
        <h2>How We Use Your Data</h2>
        <p>Your data is used solely to deliver news content and improve your experience. We never sell your personal information to third parties.</p>
        <h2>Contact</h2>
        <p>For privacy concerns, contact us at privacy@pulsehub.com.</p>
      </div>
    </div>
  );
}