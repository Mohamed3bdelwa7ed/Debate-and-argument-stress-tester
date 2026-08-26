/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'BlinkMacSystemFont', 'Segoe UI', 'Roboto', 'sans-serif'],
      },
      colors: {
        surface: {
          DEFAULT: '#faf8ff',
          dim: '#d2d9f4',
          bright: '#faf8ff',
          lowest: '#ffffff',
          low: '#f2f3ff',
          container: '#eaedff',
          high: '#e2e7ff',
          highest: '#dae2fd',
        },
        ink: {
          DEFAULT: '#131b2e',
          variant: '#464555',
          inverse: '#eef0ff',
        },
        primary: {
          DEFAULT: '#3525cd',
          container: '#4f46e5',
          on: '#ffffff',
          'on-container': '#dad7ff',
          fixed: '#e2dfff',
          'fixed-dim': '#c3c0ff',
          'on-fixed': '#0f0069',
        },
        secondary: {
          DEFAULT: '#712ae2',
          container: '#8a4cfc',
          on: '#ffffff',
          fixed: '#eaddff',
          'on-fixed': '#25005a',
        },
        tertiary: {
          DEFAULT: '#684000',
          container: '#885500',
          on: '#ffffff',
        },
        accent: {
          outline: '#777587',
          'outline-variant': '#c7c4d8',
          border: '#e2e8f0',
        },
        role: {
          challenger: '#ef4444',
          defender: '#10b981',
          judge: '#f59e0b',
        }
      },
      boxShadow: {
        'card': '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -2px rgba(0, 0, 0, 0.05)',
        'card-hover': '0 10px 15px -3px rgba(0, 0, 0, 0.08)',
        'popover': '0 20px 25px -5px rgba(0, 0, 0, 0.1)',
      },
      borderRadius: {
        '2xl': '1rem',
        '3xl': '1.5rem',
      },
      maxWidth: {
        'content': '800px',
        'container': '1280px',
      }
    },
  },
  plugins: [],
}
