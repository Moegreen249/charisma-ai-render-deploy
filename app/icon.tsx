import { ImageResponse } from 'next/og'
 
// Route segment config
export const runtime = 'edge'
 
// Image metadata
export const size = {
  width: 32,
  height: 32,
}
export const contentType = 'image/png'
 
// Image generation
export default function Icon() {
  return new ImageResponse(
    (
      <div
        style={{
          fontSize: 24,
          background: 'linear-gradient(135deg, #8b5cf6 0%, #06b6d4 50%, #10b981 100%)',
          width: '100%',
          height: '100%',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          color: 'white',
          borderRadius: '50%',
          position: 'relative',
        }}
      >
        {/* Brain symbol */}
        <div
          style={{
            fontSize: '18px',
            fontWeight: 'bold',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          🧠
        </div>
        {/* AI spark */}
        <div
          style={{
            position: 'absolute',
            top: '4px',
            right: '4px',
            fontSize: '8px',
          }}
        >
          ✨
        </div>
      </div>
    ),
    {
      ...size,
    }
  )
}