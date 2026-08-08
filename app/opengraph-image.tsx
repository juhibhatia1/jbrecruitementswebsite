import { ImageResponse } from 'next/og';
import { readFileSync } from 'fs';
import { join } from 'path';

export const alt = 'JB Recruitment Solutions';
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/png';

export default function Image() {
  const logoPath = join(process.cwd(), 'public', 'logo.png');
  let logoData;
  try {
    logoData = readFileSync(logoPath);
  } catch (e) {
    console.error("Could not load logo", e);
    logoData = Buffer.from('');
  }

  return new ImageResponse(
    (
      <div
        style={{
          background: 'white',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '80px',
        }}
      >
        {logoData.length > 0 ? (
          <img
            src={`data:image/png;base64,${logoData.toString('base64')}`}
            style={{
              width: '100%',
              height: '100%',
              objectFit: 'contain',
            }}
          />
        ) : (
          <div style={{ fontSize: 60, fontWeight: 'bold' }}>
            JB Recruitment Solutions
          </div>
        )}
      </div>
    ),
    {
      ...size,
    }
  );
}
