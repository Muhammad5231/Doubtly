import { ImageResponse } from 'next/og';

export const runtime = 'edge';

export const alt = 'Doubtly — Every doubt, solved.';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between',
          padding: '80px',
          background: '#0B1120',
          backgroundImage:
            'radial-gradient(circle at 25% 25%, rgba(79, 70, 229, 0.25) 0%, transparent 50%), radial-gradient(circle at 75% 75%, rgba(8, 145, 178, 0.2) 0%, transparent 50%)',
          fontFamily: 'sans-serif',
        }}
      >
        {/* Brand Top Bar */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '20px' }}>
          <div
            style={{
              width: '64px',
              height: '64px',
              borderRadius: '20px',
              background: 'linear-gradient(135deg, #4F46E5 0%, #0891B2 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              boxShadow: '0 10px 25px -5px rgba(79, 70, 229, 0.5)',
            }}
          >
            <svg
              width="36"
              height="36"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.39913C11.0108 7.03016 11.7289 6.88048 12.4272 6.97671C13.1255 7.07295 13.7589 7.40879 14.2151 7.92523C14.6713 8.44167 14.9211 9.10444 14.92 9.8C14.92 11.2 12.92 12.6 12.92 12.6"
                stroke="#FFFFFF"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <circle cx="12" cy="17" r="1.5" fill="#FBBF24" />
            </svg>
          </div>

          <div style={{ display: 'flex', fontSize: '38px', fontWeight: 800 }}>
            <span style={{ color: '#F8FAFC' }}>Doubt</span>
            <span style={{ color: '#818CF8' }}>ly</span>
          </div>
        </div>

        {/* Center Tagline & Headline */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              padding: '8px 20px',
              borderRadius: '999px',
              backgroundColor: 'rgba(79, 70, 229, 0.2)',
              border: '1px solid rgba(79, 70, 229, 0.4)',
              color: '#FBBF24',
              fontSize: '18px',
              fontWeight: 600,
              width: 'max-content',
            }}
          >
            ★ 100% Free Academic Knowledge Base
          </div>

          <div
            style={{
              fontSize: '60px',
              fontWeight: 800,
              color: '#FFFFFF',
              letterSpacing: '-0.02em',
              lineHeight: 1.15,
              maxWidth: '960px',
            }}
          >
            Every doubt, solved. Step-by-step academic solutions & PDF notes.
          </div>
        </div>

        {/* Bottom Bar Info */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            borderTop: '1px solid rgba(255, 255, 255, 0.1)',
            paddingTop: '28px',
            color: '#94A3B8',
            fontSize: '18px',
          }}
        >
          <span>No student login required • Instant solutions & video lectures</span>
          <span style={{ color: '#818CF8', fontWeight: 600 }}>doubtly.edu</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}

