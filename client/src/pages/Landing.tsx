import { Button } from "@/components/ui/button";
import { useLocation, Link } from "wouter";
import { useState, useEffect } from "react";
import { AnimatedBanners } from "@/components/AnimatedBanners";

export default function Landing() {
  const [, setLocation] = useLocation();
  const [scrollPosition, setScrollPosition] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setScrollPosition((prev) => (prev - 1) % 200);
    }, 39);
    return () => clearInterval(interval);
  }, []);
  
  return (
    <>
      <AnimatedBanners />
      <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-b from-blue-50 to-white relative z-10">
      <div className="max-w-4xl w-full text-center space-y-12 p-8">
        {/* Main Heading */}
        <h1 className="text-6xl md:text-7xl font-bold text-gray-900 tracking-tight">
          Train yourself at any time
        </h1>

        {/* Scrolling Banner Container */}
        <div className="w-full overflow-hidden bg-gradient-to-r from-blue-500 to-purple-600 py-8 rounded-lg shadow-lg">
          <div 
            className="whitespace-nowrap text-white text-3xl md:text-4xl font-semibold"
            style={{
              transform: `translateX(${scrollPosition}%)`,
              transition: 'transform 0.039s linear'
            }}
          >
            with on screen scrolling banners  •  •  •  with on screen scrolling banners  •  •  •  with on screen scrolling banners  •  •  •  with on screen scrolling banners  •  •  •
          </div>
        </div>

        {/* Get Started Button */}
        <div className="pt-8">
          <Link href="/plans">
            <Button 
              size="lg" 
              variant="default"
              className="text-3xl px-16 py-8 rounded-full shadow-2xl hover:shadow-3xl transform hover:scale-105 transition-all duration-200"
            >
              Get Started
            </Button>
          </Link>
        </div>
      </div>
    </div>
    </>
  );
}