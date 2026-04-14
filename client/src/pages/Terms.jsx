import { Link } from 'react-router-dom';

export default function Terms() {
  return (
    <main className="max-w-4xl mx-auto px-4 pb-20">
      <h1 className="page-title">Terms and Conditions</h1>
      
      <div className="card" style={{padding: '24px', marginTop: '20px'}}>
        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>1. Acceptance of Terms</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          By accessing and using GANJI ("the Platform"), you accept and agree to be bound by the terms and provision of this agreement.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>2. Age Restriction</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          You must be at least 18 years of age to use this platform. By using GANJI, you represent and warrant that you are at least 18 years old.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>3. User Accounts</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          You are responsible for maintaining the confidentiality of your account and password. You agree to accept responsibility for all activities that occur under your account.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>4. Prediction Markets</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          GANJI is a prediction market platform where users can create and trade on the outcome of real-world events. All bets are final and cannot be reversed.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>5. Financial Risk</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          Trading prediction markets involves financial risk. You should never bet more than you can afford to lose. GANJI is not responsible for any financial losses incurred through the use of this platform.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>6. Market Resolution</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          Market creators are responsible for resolving their markets accurately based on real-world outcomes. Disputes should be resolved through the platform's dispute resolution process.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>7. Prohibited Activities</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          You agree not to use the platform for any illegal purpose or activity. This includes but is not limited to money laundering, fraud, or any activity that violates local, national, or international laws.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>8. Platform Fees</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          Market creators charge a 10% fee on all bets placed on their markets. This fee is deducted from each bet and credited to the market creator upon resolution.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>9. Limitation of Liability</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          GANJI shall not be liable for any indirect, incidental, special, consequential or punitive damages, including without limitation, loss of profits, data, use, goodwill, or other intangible losses.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>10. Changes to Terms</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          We reserve the right to modify these terms at any time. Your continued use of the platform following any changes indicates your acceptance of the new terms.
        </p>

        <h2 style={{fontSize: '1.25rem', marginBottom: '16px', color: '#fff'}}>11. Contact</h2>
        <p style={{color: 'var(--text-secondary)', marginBottom: '16px'}}>
          For questions about these Terms and Conditions, please contact us through the platform.
        </p>

        <div style={{marginTop: '32px', paddingTop: '16px', borderTop: '1px solid var(--border)'}}>
          <Link to="/" style={{color: '#00e676', textDecoration: 'none'}}>← Back to Home</Link>
        </div>
      </div>
    </main>
  );
}