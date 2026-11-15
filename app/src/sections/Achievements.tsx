import { useEffect, useRef, useState } from 'react';
import { Code2, Medal, Star, Trophy } from 'lucide-react';
import { API_ENDPOINTS } from '../config/api';
import { refreshSwarm } from '../lib/cursorSwarm';

interface Achievement {
  _id: string;
  title: string;
  description: string;
  category: string;
  date: string;
}

const icons = [Trophy, Code2, Star, Medal];

export default function Achievements() {
  const ref = useRef<HTMLDivElement>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);

  useEffect(() => {
    const fetchAchievements = async () => {
      try {
        const response = await fetch(`${API_ENDPOINTS.PORTFOLIO}/achievements`);
        if (!response.ok) throw new Error(`Achievements request failed: ${response.status}`);
        const data: Achievement[] = await response.json();
        setAchievements(Array.isArray(data) ? data : []);
        refreshSwarm();
      } catch (error) {
        console.error('Failed to fetch milestones:', error);
      }
    };
    fetchAchievements();
  }, []);

  return (
    <section id="achievements" className="bg-[#F3EEE3] px-5 py-16 text-[#111111] sm:px-8 md:py-24 lg:px-12">
      <div className="mx-auto max-w-[1200px]">
        <div ref={ref}>
          <div className="mb-14 grid gap-8 border-t border-[#111111]/25 pt-5 lg:grid-cols-[0.7fr_1.3fr] lg:gap-24">
            <span className="font-mono text-xs uppercase tracking-[0.16em] text-[#111111]/55">07 / Recognition</span>
            <div>
              <h2 data-cs="type" className="font-display text-4xl font-semibold leading-tight tracking-[-0.04em] sm:text-5xl">
                Milestones &amp; Recognition
              </h2>
              <p data-cs="words" className="mt-5 max-w-xl font-serif text-base leading-7 text-[#111111]/65">
                A record of moments where persistence, curiosity, and useful work became visible.
              </p>
            </div>
          </div>

          <div className="grid border-t border-[#111111]/20 md:grid-cols-2">
            {achievements.map((achievement, index) => {
              const Icon = icons[index % icons.length];
              return (
                <article
                  key={achievement._id || achievement.title}
                  data-cs="frame"
                  data-cs-copy="true"
                  className="border-b border-[#111111]/20 py-7 transition-all duration-300 hover:-translate-y-1 md:odd:mr-8 md:even:ml-8"
                >
                  <div className="flex items-start gap-4">
                    <Icon className="mt-1 h-5 w-5 flex-shrink-0 text-[#D9541E]" />
                    <div>
                      <p data-cs="words" className="font-mono text-xs uppercase tracking-[0.08em] text-[#111111]/50">{achievement.category}</p>
                      <h3 data-cs="type" className="mt-2 font-display text-2xl font-semibold leading-tight">{achievement.title}</h3>
                      <p data-cs="words" className="mt-3 font-serif text-sm leading-6 text-[#111111]/70">{achievement.description}</p>
                      <p data-cs="words" className="mt-4 font-mono text-xs uppercase tracking-[0.08em] text-[#D9541E]">{achievement.date}</p>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
          {achievements.length === 0 && (
            <p className="border-b border-[#111111]/20 py-10 font-mono text-xs uppercase tracking-[0.08em] text-[#111111]/55">
              Recognition details are being updated.
            </p>
          )}
        </div>
      </div>
    </section>
  );
}
