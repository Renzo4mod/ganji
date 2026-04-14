import { Link } from 'react-router-dom';

export default function Privacy() {
  return (
    <main className="max-w-4xl mx-auto px-4 pb-20">
      <h1 className="page-title">Privacy Policy</h1>
      
      <div className="card" style={{padding: '24px', marginTop: '20px'}}>
        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>1. Information We Collect</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          We collect information you provide directly to us, including your username, email address, and phone number when you create an account. We also collect transaction data related to your betting activities.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>2. How We Use Your Information</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          We use your information to: provide and maintain our services, process your transactions, communicate with you about your account, and comply with legal obligations.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>3. Data Storage</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          Your personal data is stored securely on our servers. We implement appropriate technical and organizational measures to protect your data against unauthorized access, alteration, disclosure, or destruction.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>4. Information Sharing</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          We do not sell, trade, or otherwise transfer your personal information to outside parties. We may share information with service providers who assist us in operating our platform, as long as those parties agree to keep this information confidential.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>5. M-Pesa Transactions</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          When you use M-Pesa for deposits or withdrawals, we collect transaction data necessary to process payments. This data is shared with Safaricom's M-Pesa service to complete transactions.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>6. Cookies</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          We use cookies to enhance your experience. You can choose to disable cookies through your browser settings, but this may affect the functionality of the platform.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>7. Third-Party Links</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          Our platform may contain links to third-party websites. We have no control over the content or practices of these sites and are not responsible for their privacy policies.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>8. Your Rights</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          You have the right to access, correct, or delete your personal information. You may also request that we restrict the processing of your data. To exercise these rights, please contact us through the platform.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>9. Data Retention</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          We will retain your personal information only for as long as necessary to fulfill the purposes outlined in this privacy policy, unless a longer retention period is required by law.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>10. Children's Privacy</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          Our service is not intended for users under 18 years of age. We do not knowingly collect personal information from children under 18.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>11. Changes to Policy</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          We may update this privacy policy from time to time. We will notify you of any changes by posting the new policy on this page and updating the "last updated" date.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>12. Contact Us</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          If you have any questions about this Privacy Policy, please contact us through the platform.
        </p>

        <p style={{color: 'var(--text-muted)', marginTop: '32px'}}>
          Last updated: April 2026
        </p>

        <div style={{marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border)'}}>
          <Link to="/" style={{color: '#00e676', textDecoration: 'none'}}>← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}