"use client";

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from "@/lib/utils";

interface CarouselProps {
  children: React.ReactNode[];
  className?: string;
}

export function Carousel({ children, className }: CarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  const next = () => {
    setCurrentIndex((current) => 
      current === React.Children.count(children) - 1 ? 0 : current + 1
    );
  };

  const previous = () => {
    setCurrentIndex((current) => 
      current === 0 ? React.Children.count(children) - 1 : current - 1
    );
  };

  return (
    <div className={cn("relative group", className)}>
      <div className="overflow-hidden">
        <div
          className="flex transition-transform duration-300 ease-in-out"
          style={{
            transform: `translateX(-${currentIndex * 100}%)`,
          }}
        >
          {children}
        </div>
      </div>

      {React.Children.count(children) > 1 && (
        <>
          <button
            onClick={previous}
            className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 
                     rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity
                     shadow-md"
            aria-label="Previous slide"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={next}
            className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 hover:bg-white/90 
                     rounded-full p-2 opacity-0 group-hover:opacity-100 transition-opacity
                     shadow-md"
            aria-label="Next slide"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </>
      )}

      {React.Children.count(children) > 1 && (
        <div className="absolute bottom-2 left-0 right-0 flex justify-center space-x-2">
          {React.Children.map(children, (_, index) => (
            <button
              onClick={() => setCurrentIndex(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentIndex ? 'bg-white' : 'bg-white/50'
              }`}
              aria-label={`Go to slide ${index + 1}`}
            />
          ))}
        </div>
      )}
    </div>
  );
}