
import type { Config } from "tailwindcss";

export default {
	darkMode: ["class"],
	content: [
		"./pages/**/*.{ts,tsx}",
		"./components/**/*.{ts,tsx}",
		"./app/**/*.{ts,tsx}",
		"./src/**/*.{ts,tsx}",
	],
	prefix: "",
	theme: {
		container: {
			center: true,
			padding: '2rem',
			screens: {
				'2xl': '1400px'
			}
		},
		extend: {
			colors: {
				border: 'hsl(var(--border))',
				input: 'hsl(var(--input))',
				ring: 'hsl(var(--ring))',
				background: 'hsl(var(--background))',
				foreground: 'hsl(var(--foreground))',
				primary: {
					DEFAULT: 'hsl(var(--primary))',
					foreground: 'hsl(var(--primary-foreground))'
				},
				secondary: {
					DEFAULT: 'hsl(var(--secondary))',
					foreground: 'hsl(var(--secondary-foreground))'
				},
				destructive: {
					DEFAULT: 'hsl(var(--destructive))',
					foreground: 'hsl(var(--destructive-foreground))'
				},
				muted: {
					DEFAULT: 'hsl(var(--muted))',
					foreground: 'hsl(var(--muted-foreground))'
				},
				accent: {
					DEFAULT: 'hsl(var(--accent))',
					foreground: 'hsl(var(--accent-foreground))'
				},
				popover: {
					DEFAULT: 'hsl(var(--popover))',
					foreground: 'hsl(var(--popover-foreground))'
				},
				card: {
					DEFAULT: 'hsl(var(--card))',
					foreground: 'hsl(var(--card-foreground))'
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
				},
				// Cyberpunk theme colors
				neon: {
					purple: '#9b87f5',
					darkPurple: '#7E69AB',
					vividPurple: '#8B5CF6',
					pink: '#D946EF',
					orange: '#F97316',
					blue: '#1EAEDB',
					skyBlue: '#33C3F0',
				},
				cyber: {
					dark: '#1A1F2C',
					gray: '#221F26',
					charcoal: '#403E43',
					black: '#0006',
					transparent: '#0000001a',
				}
			},
			borderRadius: {
				lg: 'var(--radius)',
				md: 'calc(var(--radius) - 2px)',
				sm: 'calc(var(--radius) - 4px)'
			},
			keyframes: {
				'accordion-down': {
					from: {
						height: '0'
					},
					to: {
						height: 'var(--radix-accordion-content-height)'
					}
				},
				'accordion-up': {
					from: {
						height: 'var(--radix-accordion-content-height)'
					},
					to: {
						height: '0'
					}
				},
				'glitch': {
					'0%': {
						transform: 'translate(0)'
					},
					'20%': {
						transform: 'translate(-5px, 5px)'
					},
					'40%': {
						transform: 'translate(-5px, -5px)'
					},
					'60%': {
						transform: 'translate(5px, 5px)'
					},
					'80%': {
						transform: 'translate(5px, -5px)'
					},
					'100%': {
						transform: 'translate(0)'
					}
				},
				'flicker': {
					'0%, 100%': {
						opacity: '1'
					},
					'33%': {
						opacity: '0.75'
					},
					'66%': {
						opacity: '0.9'
					}
				},
				'reality-shift': {
					'0%': {
						filter: 'hue-rotate(0deg) blur(0px)'
					},
					'50%': {
						filter: 'hue-rotate(180deg) blur(4px)'
					},
					'100%': {
						filter: 'hue-rotate(360deg) blur(0px)'
					}
				},
				'float': {
					'0%, 100%': {
						transform: 'translateY(0)'
					},
					'50%': {
						transform: 'translateY(-10px)'
					}
				},
				'scan-line': {
					'0%': {
						transform: 'translateY(0)'
					},
					'100%': {
						transform: 'translateY(100vh)'
					}
				}
			},
			animation: {
				'accordion-down': 'accordion-down 0.2s ease-out',
				'accordion-up': 'accordion-up 0.2s ease-out',
				'glitch': 'glitch 0.5s ease infinite',
				'flicker': 'flicker 2s linear infinite',
				'reality-shift': 'reality-shift 1s ease-in-out',
				'float': 'float 3s ease-in-out infinite',
				'scan-line': 'scan-line 8s linear infinite'
			},
			fontFamily: {
				'cyber': ['Share Tech Mono', 'monospace'],
				'futuristic': ['Orbitron', 'sans-serif']
			},
			backgroundImage: {
				'cyber-grid': 'linear-gradient(rgba(16, 16, 28, 0.8) 2px, transparent 2px), linear-gradient(90deg, rgba(16, 16, 28, 0.8) 2px, transparent 2px)',
				'cyber-noise': 'url("data:image/svg+xml,%3Csvg viewBox=\'0 0 200 200\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cfilter id=\'noiseFilter\'%3E%3CfeTurbulence type=\'fractalNoise\' baseFrequency=\'0.65\' numOctaves=\'3\' stitchTiles=\'stitch\'/%3E%3C/filter%3E%3Crect width=\'100%\' height=\'100%\' filter=\'url(%23noiseFilter)\'/%3E%3C/svg%3E")',
				'reality-physical': 'linear-gradient(to bottom, #1f1f3a, #2a1a3a)',
				'reality-digital': 'linear-gradient(to bottom, #1a3a2a, #1a2a3a)'
			}
		}
	},
	plugins: [require("tailwindcss-animate")],
} satisfies Config;
