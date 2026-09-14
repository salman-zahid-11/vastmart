import './TermsAndConditions.css';

function TermsAndConditions() {
  return (
    <main className="legal-page">
      <div className="legal-page__hero">
        <p className="legal-page__eyebrow">VastMart legal</p>
        <h1>Terms and Conditions</h1>
        <p>These terms explain the rules for using the VastMart marketplace.</p>
        <small>Last updated: September 14, 2026</small>
      </div>
      <article className="legal-page__content">
        <section><h2>1. Using VastMart</h2><p>You must provide accurate account information and keep your login details private. You are responsible for activity performed through your account.</p></section>
        <section><h2>2. Marketplace purchases</h2><p>Product descriptions, prices, availability, delivery estimates, and seller policies may change. Orders are subject to confirmation and applicable delivery or payment conditions.</p></section>
        <section><h2>3. Seller and customer responsibilities</h2><p>Customers must use the platform lawfully. Sellers must provide genuine products, accurate information, and fulfill accepted orders according to applicable law.</p></section>
        <section><h2>4. Prohibited activity</h2><p>Do not misuse the platform, attempt unauthorized access, upload harmful content, submit fraudulent orders, or interfere with the security or availability of VastMart.</p></section>
        <section><h2>5. Account safety and termination</h2><p>We may restrict or terminate accounts that violate these terms, create security risks, or engage in fraudulent or abusive behavior. You may stop using your account at any time.</p></section>
        <section><h2>6. Support and changes</h2><p>Contact VastMart support for account or order assistance. We may update these terms when the service or legal requirements change; continued use means you accept the updated terms.</p></section>
      </article>
    </main>
  );
}

export default TermsAndConditions;
