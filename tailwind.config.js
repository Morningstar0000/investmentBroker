/** @type {import('tailwindcss').Config} */
const config = {
  darkMode: ["class"],
  content: [
    // Ensure these paths correctly point to ALL your React component files
    // and any HTML files that might contain Tailwind classes.
    // Adjust if your main HTML file is not index.html or components are elsewhere.
    "./index.html",
    "./src/**/*.{js,jsx,ts,tsx}", // This covers all JS/JSX files in src/
    // If you have components outside src/ (e.g., directly in root), add them here:
    // "./*.{js,jsx,ts,tsx}",
  ],
  theme: {
    extend: {
       fontFamily: {
        'emoji': ['"Apple Color Emoji"', '"Segoe UI Emoji"', '"Segoe UI Symbol"', '"Noto Color Emoji"', 'sans-serif'],
      },
      colors: {
        // These are the custom colors from shadcn/ui's default theme
        // You'll need to define these CSS variables in your src/index.css (or similar)
        // For example:
        // :root {
        //   --background: 0 0% 100%;
        //   --foreground: 222.2 84% 4.9%;
        //   --card: 0 0% 100%;
        //   --card-foreground: 222.2 84% 4.9%;
        //   --popover: 0 0% 100%;
        //   --popover-foreground: 222.2 84% 4.9%;
        //   --primary: 222.2 47.4% 11.2%;
        //   --primary-foreground: 210 40% 98%;
        //   --secondary: 210 40% 96.1%;
        //   --secondary-foreground: 222.2 47.4% 11.2%;
        //   --muted: 210 40% 96.1%;
        //   --muted-foreground: 215.4 16.3% 46.9%;
        //   --accent: 210 40% 96.1%;
        //   --accent-foreground: 222.2 47.4% 11.2%;
        //   --destructive: 0 84.2% 60.2%;
        //   --destructive-foreground: 210 40% 98%;
        //   --border: 214.3 31.8% 91.4%;
        //   --input: 214.3 31.8% 91.4%;
        //   --ring: 222.2 47.4% 11.2%;
        //   --radius: 0.5rem;
        // }
        // [data-theme="dark"] {
        //   --background: 222.2 84% 4.9%;
        //   --foreground: 210 40% 98%;
        //   --card: 222.2 84% 4.9%;
        //   --card-foreground: 210 40% 98%;
        //   --popover: 222.2 84% 4.9%;
        //   --popover-foreground: 210 40% 98%;
        //   --primary: 210 40% 98%;
        //   --primary-foreground: 222.2 47.4% 11.2%;
        //   --secondary: 217.2 32.6% 17.5%;
        //   --secondary-foreground: 210 40% 98%;
        //   --muted: 217.2 32.6% 17.5%;
        //   --muted-foreground: 215 20.2% 65.1%;
        //   --accent: 217.2 32.6% 17.5%;
        //   --accent-foreground: 210 40% 98%;
        //   --destructive: 0 62.8% 30.6%;
        //   --destructive-foreground: 210 40% 98%;
        //   --border: 217.2 32.6% 17.5%;
        //   --input: 217.2 32.6% 17.5%;
        //   --ring: 212.7 26.8% 83.9%;
        // }

        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
        // Custom colors for sidebar (from your original tailwind.config.ts)
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
        // Chart colors (from your original tailwind.config.ts)
        chart: {
          '1': 'hsl(var(--chart-1))',
          '2': 'hsl(var(--chart-2))',
          '3': 'hsl(var(--chart-3))',
          '4': 'hsl(var(--chart-4))',
          '5': 'hsl(var(--chart-5))'
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      // Keyframes and animations from your original tailwind.config.ts
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
        }
      },
      animation: {
        'accordion-down': 'accordion-down 0.2s ease-out',
        'accordion-up': 'accordion-up 0.2s ease-out'
      }
    },
  },
  plugins: [
    require("tailwindcss-animate"), // This plugin is likely needed for shadcn/ui animations
  ],

};

export default config;
