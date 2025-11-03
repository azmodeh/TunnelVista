import type { Config } from "tailwindcss";
    import plugin from "tailwindcss/plugin";

    const config = {
      darkMode: ["class"],
      content: [
        './pages/**/*.{ts,tsx}',
        './components/**/*.{ts,tsx}',
        './app/**/*.{ts,tsx}',
        './src/**/*.{ts,tsx}',
      ],
      prefix: "",
      theme: {
        container: {
          center: true,
          padding: "2rem",
          screens: {
            "2xl": "1400px",
          },
        },
        extend: {
          fontFamily: {
            vazirmatn: ['Vazirmatn', 'sans-serif'],
            inter: ['Inter', 'sans-serif'],
          },
          keyframes: {
            "accordion-down": {
              from: { height: "0" },
              to: { height: "var(--radix-accordion-content-height)" },
            },
            "accordion-up": {
              from: { height: "var(--radix-accordion-content-height)" },
              to: { height: "0" },
            },
          },
          animation: {
            "accordion-down": "accordion-down 0.2s ease-out",
            "accordion-up": "accordion-up 0.2s ease-out",
          },
        },
      },
      plugins: [
        require("tailwindcss-animate"),
        plugin(({ addVariant }) => {
          addVariant('rtl', '[dir="rtl"] &');
          addVariant('ltr', '[dir="ltr"] &');
        }),
      ],
    } satisfies Config

    export default config