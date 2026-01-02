/** @type {import('tailwindcss').Config} */
export default {
    darkMode: ["class"],
    content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
  	extend: {
  		colors: {
  			wawanesa: {
  				blue: '#017ACD',
  				'blue-hover': '#0169B3',
  				'blue-light': '#E6F3FB'
  			},
  			'rich-black': '#000000',
  			'midnight-sky': {
  				DEFAULT: '#003A5C',
  				hover: '#002E4A',
  				light: '#E6EEF3'
  			},
  			'wheatfield-orange': {
  				DEFAULT: '#D14905',
  				hover: '#B53F04',
  				light: '#FCEFE8'
  			},
  			'grassy-green': {
  				DEFAULT: '#225935',
  				hover: '#1B472A',
  				light: '#E9F2EC'
  			},
  			'prairie-gold': {
  				DEFAULT: '#FFD000',
  				hover: '#E6BB00',
  				light: '#FFFAE6'
  			},
  			surface: {
  				DEFAULT: '#FFFFFF',
  				secondary: '#FAFAF9',
  				tertiary: '#F5F5F4',
  				elevated: '#FFFFFF'
  			},
  			text: {
  				primary: '#1C1917',
  				secondary: '#57534E',
  				tertiary: '#A8A29E',
  				placeholder: '#D6D3D1',
  				inverse: '#FFFFFF'
  			},
  			border: 'hsl(var(--border))',
  			success: {
  				DEFAULT: '#225935',
  				light: '#E9F2EC'
  			},
  			warning: {
  				DEFAULT: '#FFD000',
  				light: '#FFFAE6'
  			},
  			error: {
  				DEFAULT: '#DC2626',
  				light: '#FEF2F2'
  			},
  			interactive: {
  				hover: 'rgba(28, 25, 23, 0.04)',
  				active: 'rgba(28, 25, 23, 0.08)',
  				selected: 'rgba(1, 122, 205, 0.08)'
  			},
  			background: 'hsl(var(--background))',
  			foreground: 'hsl(var(--foreground))',
  			card: {
  				DEFAULT: 'hsl(var(--card))',
  				foreground: 'hsl(var(--card-foreground))'
  			},
  			popover: {
  				DEFAULT: 'hsl(var(--popover))',
  				foreground: 'hsl(var(--popover-foreground))'
  			},
  			primary: {
  				DEFAULT: 'hsl(var(--primary))',
  				foreground: 'hsl(var(--primary-foreground))'
  			},
  			secondary: {
  				DEFAULT: 'hsl(var(--secondary))',
  				foreground: 'hsl(var(--secondary-foreground))'
  			},
  			muted: {
  				DEFAULT: 'hsl(var(--muted))',
  				foreground: 'hsl(var(--muted-foreground))'
  			},
  			accent: {
  				DEFAULT: 'hsl(var(--accent))',
  				foreground: 'hsl(var(--accent-foreground))'
  			},
  			destructive: {
  				DEFAULT: 'hsl(var(--destructive))',
  				foreground: 'hsl(var(--destructive-foreground))'
  			},
  			input: 'hsl(var(--input))',
  			ring: 'hsl(var(--ring))',
  			chart: {
  				'1': 'hsl(var(--chart-1))',
  				'2': 'hsl(var(--chart-2))',
  				'3': 'hsl(var(--chart-3))',
  				'4': 'hsl(var(--chart-4))',
  				'5': 'hsl(var(--chart-5))'
  			},
  			sidebar: {
  				DEFAULT: 'hsl(var(--sidebar-background))',
  				foreground: 'hsl(var(--sidebar-foreground))',
  				primary: 'hsl(var(--sidebar-primary))',
  				'primary-foreground': 'hsl(var(--sidebar-primary-foreground))',
  				accent: 'hsl(var(--sidebar-accent))',
  				'accent-foreground': 'hsl(var(--sidebar-accent-foreground))',
  				border: 'hsl(var(--sidebar-border))',
  				ring: 'hsl(var(--sidebar-ring))'
  			}
  		},
  		fontFamily: {
  			sans: [
  				'Inter',
  				'system-ui',
  				'-apple-system',
  				'BlinkMacSystemFont',
  				'Segoe UI',
  				'Roboto',
  				'sans-serif'
  			],
  			display: [
  				'Inter',
  				'system-ui',
  				'sans-serif'
  			],
  			mono: [
  				'JetBrains Mono',
  				'Consolas',
  				'Monaco',
  				'monospace'
  			]
  		},
  		fontSize: {
  			xs: [
  				'0.75rem',
  				{
  					lineHeight: '1rem',
  					letterSpacing: '0.01em'
  				}
  			],
  			sm: [
  				'0.875rem',
  				{
  					lineHeight: '1.25rem',
  					letterSpacing: '0.005em'
  				}
  			],
  			base: [
  				'1rem',
  				{
  					lineHeight: '1.5rem',
  					letterSpacing: '0'
  				}
  			],
  			lg: [
  				'1.125rem',
  				{
  					lineHeight: '1.75rem',
  					letterSpacing: '-0.005em'
  				}
  			],
  			xl: [
  				'1.25rem',
  				{
  					lineHeight: '1.75rem',
  					letterSpacing: '-0.01em'
  				}
  			],
  			'2xl': [
  				'1.5rem',
  				{
  					lineHeight: '2rem',
  					letterSpacing: '-0.015em'
  				}
  			],
  			'3xl': [
  				'1.875rem',
  				{
  					lineHeight: '2.25rem',
  					letterSpacing: '-0.02em'
  				}
  			],
  			'4xl': [
  				'2.25rem',
  				{
  					lineHeight: '2.5rem',
  					letterSpacing: '-0.025em'
  				}
  			],
  			'5xl': [
  				'3rem',
  				{
  					lineHeight: '1.1',
  					letterSpacing: '-0.03em'
  				}
  			]
  		},
  		spacing: {
  			'18': '4.5rem',
  			'88': '22rem',
  			'128': '32rem',
  			'144': '36rem'
  		},
  		boxShadow: {
  			soft: '0 1px 2px rgba(0, 0, 0, 0.04)',
  			medium: '0 4px 6px -1px rgba(0, 0, 0, 0.05), 0 2px 4px -1px rgba(0, 0, 0, 0.03)',
  			card: '0 0 0 1px rgba(0, 0, 0, 0.03), 0 2px 4px rgba(0, 0, 0, 0.04), 0 8px 16px rgba(0, 0, 0, 0.04)',
  			dropdown: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 10px 20px -1px rgba(0, 0, 0, 0.1)',
  			modal: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
  			focus: '0 0 0 3px rgba(1, 122, 205, 0.2)'
  		},
  		borderRadius: {
  			sm: 'calc(var(--radius) - 4px)',
  			DEFAULT: '6px',
  			md: 'calc(var(--radius) - 2px)',
  			lg: 'var(--radius)',
  			xl: '16px'
  		},
  		animation: {
  			'fade-in': 'fadeIn 0.2s ease-out',
  			'fade-out': 'fadeOut 0.2s ease-out',
  			'slide-up': 'slideUp 0.2s ease-out',
  			'slide-down': 'slideDown 0.2s ease-out',
  			'scale-in': 'scaleIn 0.15s ease-out',
  			'spin-slow': 'spin 1.5s linear infinite'
  		},
  		keyframes: {
  			fadeIn: {
  				'0%': {
  					opacity: '0'
  				},
  				'100%': {
  					opacity: '1'
  				}
  			},
  			fadeOut: {
  				'0%': {
  					opacity: '1'
  				},
  				'100%': {
  					opacity: '0'
  				}
  			},
  			slideUp: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(8px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			slideDown: {
  				'0%': {
  					opacity: '0',
  					transform: 'translateY(-8px)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'translateY(0)'
  				}
  			},
  			scaleIn: {
  				'0%': {
  					opacity: '0',
  					transform: 'scale(0.95)'
  				},
  				'100%': {
  					opacity: '1',
  					transform: 'scale(1)'
  				}
  			}
  		},
  		transitionDuration: {
  			'150': '150ms',
  			'200': '200ms'
  		}
  	}
  },
  plugins: [require("tailwindcss-animate")],
}
