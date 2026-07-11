"use client";

import { useState, Suspense, lazy } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlertTriangle,
  ArrowRight,
  BookOpen,
  Check,
  ChevronDown,
  Clock,
  DoorClosed,
  Drama,
  ExternalLink,
  Film,
  Home,
  Map as MapIcon,
  Moon,
  Shield,
  Sparkles,
  Sun,
  TrendingUp,
  Users,
} from "lucide-react";
import Link from "next/link";
import { useMessages } from "next-intl";
import { VideoFeature } from "@/components/home/VideoFeature";
import { LatestGuidesAccordion } from "@/components/home/LatestGuidesAccordion";
import { NativeBannerAd, AdBanner } from "@/components/ads";
import { getPreferredMobileBannerSelection } from "@/components/ads/mobileAdConfigs";
import { scrollToSection } from "@/lib/scrollToSection";
import { DynamicIcon } from "@/components/ui/DynamicIcon";
import type { ContentItemWithType } from "@/lib/getLatestArticles";

// Lazy load heavy components
const HeroStats = lazy(() => import("@/components/home/HeroStats"));
const FAQSection = lazy(() => import("@/components/home/FAQSection"));
const CTASection = lazy(() => import("@/components/home/CTASection"));

// Loading placeholder
const LoadingPlaceholder = ({ height = "h-64" }: { height?: string }) => (
  <div
    className={`${height} bg-white/5 border border-border rounded-xl animate-pulse`}
  />
);

// 模块标题区（eyebrow / 标题 / 副标题 / 简介）
function ModuleHeader({
  eyebrow,
  title,
  subtitle,
  intro,
  icon: Icon,
}: {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  intro?: string;
  icon?: LucideIcon;
}) {
  return (
    <div className="text-center mb-8 md:mb-12 scroll-reveal">
      {eyebrow && (
        <div className="inline-flex items-center gap-2 rounded-full px-3 py-1 mb-3 md:mb-4 bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)]">
          {Icon && (
            <Icon className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
          )}
          <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-[hsl(var(--nav-theme-light))]">
            {eyebrow}
          </span>
        </div>
      )}
      <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4 leading-tight">
        {title}
      </h2>
      {subtitle && (
        <p className="text-base md:text-lg text-foreground/90 max-w-3xl mx-auto mb-3">
          {subtitle}
        </p>
      )}
      {intro && (
        <p className="text-sm md:text-base text-muted-foreground max-w-3xl mx-auto">
          {intro}
        </p>
      )}
    </div>
  );
}

// 步骤型模块（独立 section，模块 1-4 共用布局，每次调用渲染一个独立 section）
function StepsSection({
  id,
  data,
  icon,
  alternate,
}: {
  id: string;
  data: {
    eyebrow?: string;
    title: string;
    subtitle?: string;
    intro?: string;
    steps: { title: string; description: string }[];
    tips?: string[];
  };
  icon: LucideIcon;
  alternate?: boolean;
}) {
  return (
    <section
      id={id}
      className={`scroll-mt-24 px-4 py-14 md:py-20 ${alternate ? "bg-white/[0.02]" : ""}`}
    >
      <div className="container mx-auto max-w-5xl">
        <ModuleHeader
          eyebrow={data.eyebrow}
          title={data.title}
          subtitle={data.subtitle}
          intro={data.intro}
          icon={icon}
        />

        {/* 步骤列表 */}
        <div className="scroll-reveal space-y-3 md:space-y-4 mb-8 md:mb-10">
          {data.steps.map((step, index) => (
            <div
              key={index}
              className="flex gap-3 md:gap-4 p-4 md:p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
            >
              <div className="flex h-10 w-10 md:h-12 md:w-12 flex-shrink-0 items-center justify-center rounded-full border-2 border-[hsl(var(--nav-theme)/0.5)] bg-[hsl(var(--nav-theme)/0.2)]">
                <span className="text-base md:text-xl font-bold text-[hsl(var(--nav-theme-light))]">
                  {index + 1}
                </span>
              </div>
              <div>
                <h3 className="text-lg md:text-xl font-bold mb-1.5 md:mb-2">
                  {step.title}
                </h3>
                <p className="text-sm md:text-base text-muted-foreground">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* 关键提示 */}
        {data.tips && data.tips.length > 0 && (
          <div className="scroll-reveal p-4 md:p-6 bg-[hsl(var(--nav-theme)/0.05)] border border-[hsl(var(--nav-theme)/0.3)] rounded-xl">
            <div className="flex items-center gap-2 mb-3 md:mb-4">
              <BookOpen className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
              <h3 className="font-bold text-base md:text-lg">Key Tips</h3>
            </div>
            <ul className="space-y-2">
              {data.tips.map((tip, index) => (
                <li key={index} className="flex items-start gap-2">
                  <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-1 flex-shrink-0" />
                  <span className="text-muted-foreground text-sm">{tip}</span>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </section>
  );
}

interface HomePageClientProps {
  latestArticles: ContentItemWithType[];
  locale: string;
}

export default function HomePageClient({
  latestArticles,
  locale,
}: HomePageClientProps) {
  const t = useMessages() as any;
  const siteUrl =
    process.env.NEXT_PUBLIC_SITE_URL || "https://experienceabstractionwiki.wiki";

  // 结构化数据
  const structuredData = {
    "@context": "https://schema.org",
    "@graph": [
      {
        "@type": "WebSite",
        "@id": `${siteUrl}/#website`,
        url: siteUrl,
        name: "Experience Abstraction Wiki",
        description:
          "Complete Experience Abstraction Wiki covering abstraction methods, Caine, the Cellar, characters, map locations, and Roblox updates for the TADC-inspired social horror experience.",
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Experience Abstraction - TADC-Inspired Roblox Social Horror",
        },
        potentialAction: {
          "@type": "SearchAction",
          target: `${siteUrl}/search?q={search_term_string}`,
          "query-input": "required name=search_term_string",
        },
      },
      {
        "@type": "Organization",
        "@id": `${siteUrl}/#organization`,
        name: "Experience Abstraction Wiki",
        alternateName: "Experience Abstraction",
        url: siteUrl,
        description:
          "Complete Experience Abstraction Wiki resource hub for abstraction methods, Caine, the Cellar, characters, map locations, and update guides",
        logo: {
          "@type": "ImageObject",
          url: `${siteUrl}/android-chrome-512x512.png`,
          width: 512,
          height: 512,
        },
        image: {
          "@type": "ImageObject",
          url: `${siteUrl}/images/hero.webp`,
          width: 1920,
          height: 1080,
          caption: "Experience Abstraction Wiki - TADC-Inspired Roblox Social Horror",
        },
        sameAs: [
          "https://www.roblox.com/games/131320856116838/Experience-Abstraction",
          "https://www.reddit.com/r/TheDigitalCircus/",
          "https://www.reddit.com/r/tadc/",
          "https://www.youtube.com/watch?v=idZhcXSd0ps",
        ],
      },
      {
        "@type": "VideoGame",
        name: "Experience Abstraction",
        gamePlatform: ["PC", "Mac", "Mobile", "Roblox"],
        applicationCategory: "Game",
        genre: ["Social Horror", "Adventure", "Multiplayer"],
        numberOfPlayers: {
          minValue: 1,
          maxValue: 99,
        },
        offers: {
          "@type": "Offer",
          price: "0",
          priceCurrency: "USD",
          availability: "https://schema.org/InStock",
          url: "https://www.roblox.com/games/131320856116838/Experience-Abstraction",
        },
      },
      {
        "@type": "VideoObject",
        name: "Experience Abstraction - How to Get Caine & Get Abstract in 3 Ways | Roblox All Cutscene",
        description:
          "Experience Abstraction gameplay showcase covering all three abstraction methods, the Caine encounter, and the full cutscene sequence.",
        uploadDate: "2026-03-12",
        thumbnailUrl: `${siteUrl}/images/hero.webp`,
        embedUrl: "https://www.youtube.com/embed/idZhcXSd0ps",
        url: "https://www.youtube.com/watch?v=idZhcXSd0ps",
      },
    ],
  };

  // 地图模块手风琴展开状态
  const [mapExpanded, setMapExpanded] = useState<number | null>(null);
  const mobileBannerAd = getPreferredMobileBannerSelection();

  // 8 个模块锚点（与 Tools Grid 卡片顺序一一对应）
  const toolSectionIds = [
    "how-to-abstract",
    "beginner-guide",
    "caine-guide",
    "cellar-guide",
    "survival-guide",
    "cutscenes-transformations",
    "map-dark-areas",
    "updates",
  ];

  // 生存模块卡片图标（每张不同）
  const survivalIcons = [Users, Sun, AlertTriangle, Home, Shield];
  // 过场模块卡片图标（每张不同）
  const cutsceneIcons = [Film, Moon, Drama, DoorClosed, TrendingUp];

  return (
    <div className="home-shell min-h-screen bg-background text-foreground">
      {/* 结构化数据 */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />

      {/* 广告位 1: 顶部固定横幅 */}
      <div className="sticky top-20 z-20 border-b border-border py-2">
        <AdBanner type="banner-320x50" adKey={process.env.NEXT_PUBLIC_AD_MOBILE_320X50} />
      </div>

      {/* Hero 区域 */}
      <section className="relative overflow-hidden px-4 pt-24 pb-14 md:pt-32 md:pb-20">
        <div className="container mx-auto max-w-6xl">
          <div className="text-center mb-8 scroll-reveal">
            {/* Badge */}
            <div
              className="inline-flex items-center gap-2 rounded-full px-3 py-1.5 md:px-4 md:py-2
                            bg-[hsl(var(--nav-theme)/0.1)]
                            border border-[hsl(var(--nav-theme)/0.3)] mb-4 md:mb-6"
            >
              <Sparkles className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
              <span className="text-xs md:text-sm font-medium">
                {t.hero.badge}
              </span>
            </div>

            {/* Title */}
            <h1 className="text-4xl sm:text-5xl md:text-7xl font-bold mb-4 md:mb-6 leading-[1.05]">
              {t.hero.title}
            </h1>

            {/* Description */}
            <p className="mx-auto mb-8 max-w-2xl text-base leading-7 text-muted-foreground sm:text-lg md:mb-10 md:max-w-3xl md:text-2xl">
              {t.hero.description}
            </p>

            {/* CTA Buttons */}
            <div className="mb-10 flex flex-col justify-center gap-3 sm:flex-row md:mb-12 md:gap-4">
              <button
                onClick={() => scrollToSection("how-to-abstract")}
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           bg-[hsl(var(--nav-theme))] hover:bg-[hsl(var(--nav-theme)/0.9)]
                           text-white rounded-lg font-semibold text-base md:text-lg transition-colors"
              >
                <BookOpen className="w-5 h-5" />
                {t.hero.getFreeCodesCTA}
              </button>
              <a
                href="https://www.roblox.com/games/131320856116838/Experience-Abstraction"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center justify-center gap-2 px-6 py-3.5 md:px-8 md:py-4
                           border border-border hover:bg-white/10 rounded-lg
                           font-semibold text-base md:text-lg transition-colors"
              >
                {t.hero.playOnRobloxCTA}
                <ArrowRight className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Stats */}
          <Suspense fallback={<LoadingPlaceholder height="h-32" />}>
            <HeroStats stats={Object.values(t.hero.stats)} />
          </Suspense>
        </div>
      </section>

      {/* 视频区 - 紧跟 Hero（进入视口自动播放） */}
      <section className="px-4 py-10 md:py-12">
        <div className="scroll-reveal container mx-auto max-w-5xl">
          <div className="relative overflow-hidden rounded-2xl">
            <VideoFeature
              videoId="idZhcXSd0ps"
              title="Experience Abstraction - How to Get Caine & Get Abstract in 3 Ways | Roblox All Cutscene"
            />
          </div>
        </div>
      </section>

      {/* Tools Grid - 8 Navigation Cards（模块导航区，位于视频区之后、Latest Updates 之前） */}
      <section className="px-4 py-14 md:py-20 bg-white/[0.02]">
        <div className="container mx-auto max-w-5xl">
          <div className="text-center mb-8 md:mb-12 scroll-reveal">
            <h2 className="text-3xl md:text-5xl font-bold mb-3 md:mb-4">
              {t.tools.title}{" "}
              <span className="text-[hsl(var(--nav-theme-light))]">
                {t.tools.titleHighlight}
              </span>
            </h2>
            <p className="text-base md:text-lg text-muted-foreground">
              {t.tools.subtitle}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3 md:grid-cols-3 md:gap-4 lg:grid-cols-4">
            {t.tools.cards.map((card: any, index: number) => {
              const sectionId = toolSectionIds[index];
              return (
                <button
                  key={index}
                  onClick={() => scrollToSection(sectionId)}
                  className="scroll-reveal group rounded-xl border border-border p-4 md:p-6
                             bg-card hover:border-[hsl(var(--nav-theme)/0.5)]
                             transition-all duration-300 cursor-pointer text-left
                             hover:shadow-lg hover:shadow-[hsl(var(--nav-theme)/0.1)]"
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  <div
                    className="mb-3 h-10 w-10 rounded-lg md:mb-4 md:h-12 md:w-12
                                  bg-[hsl(var(--nav-theme)/0.1)]
                                  flex items-center justify-center
                                  group-hover:bg-[hsl(var(--nav-theme)/0.2)]
                                  transition-colors"
                  >
                    <DynamicIcon
                      name={card.icon}
                      className="h-5 w-5 md:h-6 md:w-6 text-[hsl(var(--nav-theme-light))]"
                    />
                  </div>
                  <h3 className="mb-1.5 text-sm md:text-base font-semibold">
                    {card.title}
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    {card.description}
                  </p>
                </button>
              );
            })}
          </div>
        </div>
      </section>

      {/* Latest Updates 模块（保留，内容为空时自动隐藏） */}
      <LatestGuidesAccordion
        articles={latestArticles}
        locale={locale}
        max={12}
      />

      {/* 广告位 2: 首屏内容之后再加载广告 */}
      <NativeBannerAd adKey={process.env.NEXT_PUBLIC_AD_NATIVE_BANNER || ""} />

      {/* 广告位 3: 移动端优先使用方形，桌面端保留横幅 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Module 1: How to Abstract */}
      <StepsSection
        id="how-to-abstract"
        data={t.modules.howToAbstract}
        icon={Sparkles}
      />

      {/* 广告位 4: 第一模块之后的阅读停顿位 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-468x60"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_468X60}
        className="hidden md:flex"
      />

      {/* Module 2: Beginner Guide */}
      <StepsSection
        id="beginner-guide"
        data={t.modules.beginnerGuide}
        icon={BookOpen}
        alternate
      />

      {/* Module 3: Caine Guide */}
      <StepsSection
        id="caine-guide"
        data={t.modules.caineGuide}
        icon={Drama}
      />

      {/* Module 4: Cellar Guide */}
      <StepsSection
        id="cellar-guide"
        data={t.modules.cellarGuide}
        icon={DoorClosed}
        alternate
      />

      {/* Module 5: Survival Guide */}
      <section id="survival-guide" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.survivalGuide.eyebrow}
            title={t.modules.survivalGuide.title}
            subtitle={t.modules.survivalGuide.subtitle}
            intro={t.modules.survivalGuide.intro}
            icon={Shield}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {t.modules.survivalGuide.cards.map((card: any, index: number) => {
              const Icon = survivalIcons[index] || AlertTriangle;
              return (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors flex flex-col"
                >
                  <div className="flex items-center gap-3 mb-3">
                    <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center">
                      <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                    </div>
                    <h3 className="font-bold">{card.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    <span className="font-medium text-foreground/80">Risk: </span>
                    {card.risk}
                  </p>
                  <p className="text-sm text-muted-foreground mb-3">
                    <span className="font-medium text-foreground/80">Do: </span>
                    {card.action}
                  </p>
                  <ul className="space-y-1.5 mt-auto pt-2 border-t border-border">
                    {card.signs.map((sign: string, si: number) => (
                      <li
                        key={si}
                        className="flex items-start gap-2 text-xs text-muted-foreground"
                      >
                        <AlertTriangle className="w-3.5 h-3.5 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <span>{sign}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 广告位 5: 移动端横幅 320×50 */}
      {mobileBannerAd && (
        <AdBanner
          type={mobileBannerAd.type}
          adKey={mobileBannerAd.adKey}
          className="md:hidden"
        />
      )}

      {/* Module 6: Cutscenes and Transformations */}
      <section
        id="cutscenes-transformations"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.cutscenes.eyebrow}
            title={t.modules.cutscenes.title}
            subtitle={t.modules.cutscenes.subtitle}
            intro={t.modules.cutscenes.intro}
            icon={Film}
          />
          <div className="scroll-reveal grid grid-cols-1 md:grid-cols-2 gap-4">
            {t.modules.cutscenes.cards.map((card: any, index: number) => {
              const Icon = cutsceneIcons[index] || Film;
              return (
                <div
                  key={index}
                  className="p-6 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors"
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="h-10 w-10 flex-shrink-0 rounded-lg bg-[hsl(var(--nav-theme)/0.1)] flex items-center justify-center">
                        <Icon className="w-5 h-5 text-[hsl(var(--nav-theme-light))]" />
                      </div>
                      <h3 className="font-bold">{card.title}</h3>
                    </div>
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap flex-shrink-0">
                      {card.category}
                    </span>
                  </div>
                  <dl className="space-y-2 text-sm">
                    <div>
                      <dt className="font-medium text-foreground/80 mb-0.5">Trigger</dt>
                      <dd className="text-muted-foreground">{card.trigger}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground/80 mb-0.5">Sequence</dt>
                      <dd className="text-muted-foreground">{card.sequence}</dd>
                    </div>
                    <div>
                      <dt className="font-medium text-foreground/80 mb-0.5">Result</dt>
                      <dd className="text-muted-foreground">{card.result}</dd>
                    </div>
                  </dl>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* Module 7: Map and Dark Areas（手风琴） */}
      <section id="map-dark-areas" className="scroll-mt-24 px-4 py-14 md:py-20">
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.mapAndDarkAreas.eyebrow}
            title={t.modules.mapAndDarkAreas.title}
            subtitle={t.modules.mapAndDarkAreas.subtitle}
            intro={t.modules.mapAndDarkAreas.intro}
            icon={MapIcon}
          />
          <div className="scroll-reveal space-y-3">
            {t.modules.mapAndDarkAreas.locations.map((loc: any, index: number) => (
              <div
                key={index}
                className="border border-border rounded-xl overflow-hidden bg-white/5"
              >
                <button
                  onClick={() => setMapExpanded(mapExpanded === index ? null : index)}
                  className="w-full flex items-center justify-between gap-3 p-4 md:p-5 text-left hover:bg-white/5 transition-colors"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <MapIcon className="w-5 h-5 text-[hsl(var(--nav-theme-light))] flex-shrink-0" />
                    <span className="font-semibold truncate">{loc.title}</span>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <span className="text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] whitespace-nowrap">
                      {loc.risk}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 flex-shrink-0 transition-transform ${mapExpanded === index ? "rotate-180" : ""}`}
                    />
                  </div>
                </button>
                {mapExpanded === index && (
                  <div className="px-4 md:px-5 pb-5">
                    <span className="inline-block text-xs px-2 py-1 rounded-full bg-[hsl(var(--nav-theme)/0.1)] border border-[hsl(var(--nav-theme)/0.3)] mb-3">
                      {loc.type}
                    </span>
                    <ul className="space-y-2">
                      {loc.details.map((d: string, di: number) => (
                        <li
                          key={di}
                          className="flex items-start gap-2 text-sm text-muted-foreground"
                        >
                          <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                          <span>{d}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Module 8: Updates（时间线，含外部源链接） */}
      <section
        id="updates"
        className="scroll-mt-24 px-4 py-14 md:py-20 bg-white/[0.02]"
      >
        <div className="container mx-auto max-w-5xl">
          <ModuleHeader
            eyebrow={t.modules.updates.eyebrow}
            title={t.modules.updates.title}
            subtitle={t.modules.updates.subtitle}
            intro={t.modules.updates.intro}
            icon={Clock}
          />
          <div className="scroll-reveal relative pl-6 border-l-2 border-[hsl(var(--nav-theme)/0.3)] space-y-6">
            {t.modules.updates.entries.map((entry: any, index: number) => (
              <div key={index} className="relative">
                <div className="absolute -left-[1.4rem] w-4 h-4 rounded-full bg-[hsl(var(--nav-theme))] border-2 border-background" />
                <div className="p-5 bg-white/5 border border-border rounded-xl hover:border-[hsl(var(--nav-theme)/0.5)] transition-colors">
                  <div className="flex items-center gap-2 mb-2">
                    <Clock className="w-4 h-4 text-[hsl(var(--nav-theme-light))]" />
                    <span className="text-xs text-muted-foreground">{entry.date}</span>
                  </div>
                  <h3 className="font-bold mb-2">{entry.title}</h3>
                  <ul className="space-y-1.5 mb-3">
                    {entry.changes.map((c: string, ci: number) => (
                      <li
                        key={ci}
                        className="flex items-start gap-2 text-sm text-muted-foreground"
                      >
                        <Check className="w-4 h-4 text-[hsl(var(--nav-theme-light))] mt-0.5 flex-shrink-0" />
                        <span>{c}</span>
                      </li>
                    ))}
                  </ul>
                  {entry.link && (
                    <a
                      href={entry.link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 text-xs text-[hsl(var(--nav-theme-light))] hover:underline"
                    >
                      View source
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <FAQSection
          title={t.faq.title}
          titleHighlight={t.faq.titleHighlight}
          subtitle={t.faq.subtitle}
          questions={t.faq.questions}
        />
      </Suspense>

      {/* CTA Section */}
      <Suspense fallback={<LoadingPlaceholder />}>
        <CTASection
          title={t.cta.title}
          description={t.cta.description}
          joinCommunity={t.cta.joinCommunity}
          joinGame={t.cta.joinGame}
        />
      </Suspense>

      {/* Ad Banner 3 */}
      <AdBanner
        type="banner-300x250"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_300X250}
        className="md:hidden"
      />
      <AdBanner
        type="banner-728x90"
        adKey={process.env.NEXT_PUBLIC_AD_BANNER_728X90}
        className="hidden md:flex"
      />

      {/* Footer */}
      <footer className="bg-white/[0.02] border-t border-border">
        <div className="container mx-auto px-4 py-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
            {/* Brand */}
            <div>
              <h3 className="text-xl font-bold mb-4 text-[hsl(var(--nav-theme-light))]">
                {t.footer.title}
              </h3>
              <p className="text-sm text-muted-foreground">
                {t.footer.description}
              </p>
            </div>

            {/* Community - External Links Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.community}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <a
                    href="https://www.roblox.com/games/131320856116838/Experience-Abstraction"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.roblox}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.reddit.com/r/TheDigitalCircus/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.reddit}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.reddit.com/r/tadc/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.redditTadc}
                  </a>
                </li>
                <li>
                  <a
                    href="https://www.youtube.com/watch?v=idZhcXSd0ps"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.youtube}
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal - Internal Routes Only */}
            <div>
              <h4 className="font-semibold mb-4">{t.footer.legal}</h4>
              <ul className="space-y-2 text-sm">
                <li>
                  <Link
                    href="/about"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.about}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/privacy-policy"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.privacy}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/terms-of-service"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.terms}
                  </Link>
                </li>
                <li>
                  <Link
                    href="/copyright"
                    className="text-muted-foreground hover:text-[hsl(var(--nav-theme-light))] transition"
                  >
                    {t.footer.copyrightNotice}
                  </Link>
                </li>
              </ul>
            </div>

            {/* Copyright */}
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                {t.footer.copyright}
              </p>
              <p className="text-xs text-muted-foreground">
                {t.footer.disclaimer}
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
