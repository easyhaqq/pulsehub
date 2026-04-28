export default function TermsPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-16">
      <span className="category-badge mb-4 inline-block">Legal</span>
      <h1 className="text-4xl font-extrabold text-[#0F172A] mb-6">Terms of Service</h1>
      <div className="prose-article space-y-6 text-slate-600">
        <p>By using PulseHub, you agree to these terms. Please read them carefully.</p>
        <h2>Use of Content</h2>
        <p>All content on PulseHub is protected by copyright. You may not reproduce or distribute our articles without written permission.</p>
        <h2>User Conduct</h2>
        <p>You agree not to misuse our platform or attempt to access restricted areas of the site.</p>
        <h2>Disclaimer</h2>
        <p>PulseHub provides news for informational purposes only. We are not liable for decisions made based on our content.</p>
      </div>
    </div>
  );
}