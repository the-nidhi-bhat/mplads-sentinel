"use client";

import { createContext, createElement, useContext, useState, type ReactNode } from "react";

export type Locale = "en" | "hi";

const dictionary = {
  en: {
    "topStrip": "Government of India · MPLADS Monitoring",
    "fontSize": "Font Size:",
    "nav.home": "Home",
    "nav.about": "About the Scheme",
    "nav.howItWorks": "How It Works",
    "nav.signals": "Detection Signals",
    "nav.dashboard": "Dashboard",
    "header.government": "Government of India",
    "header.brand": "MPLADS Sentinel",
    "header.tagline": "AI Audit Prioritization · SIH 2026",
    "header.login": "Login",
    "hero.headline": "MPLADS Sentinel: Better Monitoring",
    "hero.pitch": "Transforming MPLADS monitoring from reactive audits to proactive decision-support with AI.",
    "hero.explore": "Explore the Platform",
    "hero.howItWorks": "See How It Works",
    "hero.trust": "Explainable AI · Human-in-the-loop · Evidence-backed",
    "stats.projects": "Projects Tracked",
    "stats.states": "States & UTs Covered",
    "stats.signals": "Detection Signals Live",
    "stats.flagged": "Projects Flagged",
    "overview.heading": "Understanding MPLADS",
    "overview.body": "The Members of Parliament Local Area Development Scheme (MPLADS) was launched on 23 December 1993, enabling MPs to recommend developmental works — emphasizing durable community assets — based on locally felt needs in their constituencies. Each MP receives an annual entitlement of ₹5 crore, administered by the Ministry of Statistics and Programme Implementation (MoSPI).",
    "problem.heading": "The challenge isn't a lack of data. It's knowing where to look first.",
    "problem.body": "With over 24,000 active MPLADS projects across India and limited audit capacity, manual review of every project is impractical. Traditional monitoring relies on delayed post-mortem audits — by the time anomalies are found, funds may already be misallocated. Sentinel turns a large project pool into an evidence-backed audit priority queue, so auditors can focus where it matters most.",
    "problem.note": "Sentinel prioritizes attention — it does not establish wrongdoing.",
    "how.heading": "How Sentinel Works",
    "how.body": "A six-step pipeline from raw data to human investigation, with full traceability at every stage.",
    "step.data.title": "Data Sources", "step.data.description": "Public MPLADS project records, expenditure data, and implementation reports.",
    "step.ingestion.title": "Ingestion", "step.ingestion.description": "Multi-modal data streams are normalized, validated, and prepared for analysis.",
    "step.analysis.title": "Analysis", "step.analysis.description": "ML models examine cost, timeline, spatial, agency, and progress dimensions.",
    "step.score.title": "Priority Score", "step.score.description": "An explainable Audit Priority Score (0–100) is computed from weighted signals.",
    "step.evidence.title": "Evidence Pack", "step.evidence.description": "Each flag is paired with concrete evidence — observed vs. benchmark values.",
    "step.human.title": "Human Investigation", "step.human.description": "Nodal officers review evidence and make the final determination.",
    "signals.heading": "Five Detection Signals",
    "signals.body": "Each signal examines a different dimension of project data. Some are live in the prototype; others are designed for future extension.",
    "signal.cost.name": "Cost Outlier Detection", "signal.cost.description": "Compares sanctioned costs against regional benchmarks for similar works to identify statistical outliers.",
    "signal.timeline.name": "Timeline Anomaly", "signal.timeline.description": "Flags projects with completion delays that exceed expected durations relative to scope and type.",
    "signal.spatial.name": "Spatial Overlap Detection", "signal.spatial.description": "Identifies projects with geographic proximity that may represent duplicate or overlapping works.",
    "signal.agency.name": "Agency Risk Profiling", "signal.agency.description": "Aggregates historical performance by implementing agency to surface systemic patterns.",
    "signal.progress.name": "Progress-Payment Mismatch", "signal.progress.description": "Detects divergence between physical progress reported and financial expenditure logged.",
    "footer.about": "About", "footer.methodology": "Methodology", "footer.dataSources": "Data Sources", "footer.privacy": "Privacy", "footer.accessibility": "Accessibility",
    "footer.disclaimer": "Independent SIH 2026 prototype — not an official Government of India portal.",
  },
  hi: {
    "topStrip": "भारत सरकार · MPLADS निगरानी", "fontSize": "फ़ॉन्ट आकार:",
    "nav.home": "होम", "nav.about": "योजना के बारे में", "nav.howItWorks": "यह कैसे काम करता है", "nav.signals": "पता लगाने के संकेत", "nav.dashboard": "डैशबोर्ड",
    "header.government": "भारत सरकार", "header.brand": "MPLADS सेंटिनल", "header.tagline": "AI ऑडिट प्राथमिकता · SIH 2026", "header.login": "लॉग इन",
    "hero.headline": "MPLADS सेंटिनल: बेहतर निगरानी", "hero.pitch": "AI के साथ MPLADS निगरानी को प्रतिक्रियात्मक ऑडिट से सक्रिय निर्णय-सहायता में बदलना।", "hero.explore": "प्लेटफ़ॉर्म देखें", "hero.howItWorks": "यह कैसे काम करता है देखें", "hero.trust": "व्याख्यात्मक AI · मानव निगरानी · साक्ष्य-आधारित",
    "stats.projects": "ट्रैक की गई परियोजनाएँ", "stats.states": "कवर किए गए राज्य और केंद्रशासित प्रदेश", "stats.signals": "सक्रिय पहचान संकेत", "stats.flagged": "चिह्नित परियोजनाएँ",
    "overview.heading": "MPLADS को समझना", "overview.body": "सांसद स्थानीय क्षेत्र विकास योजना (MPLADS) 23 दिसंबर 1993 को शुरू की गई थी। इसके तहत सांसद अपने निर्वाचन क्षेत्रों में स्थानीय आवश्यकताओं के आधार पर विकास कार्यों की सिफारिश कर सकते हैं। प्रत्येक सांसद को ₹5 करोड़ का वार्षिक आवंटन मिलता है, जिसका प्रशासन सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI) करता है।",
    "problem.heading": "चुनौती डेटा की कमी नहीं है। चुनौती यह जानना है कि पहले कहाँ देखना है।", "problem.body": "भारत में 24,000 से अधिक सक्रिय MPLADS परियोजनाओं और सीमित ऑडिट क्षमता के कारण हर परियोजना की मैन्युअल समीक्षा व्यावहारिक नहीं है। पारंपरिक निगरानी में विलंबित ऑडिट पर निर्भरता रहती है। सेंटिनल परियोजनाओं के बड़े समूह को साक्ष्य-आधारित ऑडिट प्राथमिकता सूची में बदलता है, ताकि ऑडिटर सबसे महत्वपूर्ण मामलों पर ध्यान दे सकें।", "problem.note": "सेंटिनल ध्यान को प्राथमिकता देता है — यह गलत कार्य स्थापित नहीं करता।",
    "how.heading": "सेंटिनल कैसे काम करता है", "how.body": "कच्चे डेटा से मानव जांच तक छह चरणों की प्रक्रिया, जिसमें हर चरण में पूरी traceability है।",
    "step.data.title": "डेटा स्रोत", "step.data.description": "सार्वजनिक MPLADS परियोजना रिकॉर्ड, व्यय डेटा और कार्यान्वयन रिपोर्ट।", "step.ingestion.title": "डेटा ग्रहण", "step.ingestion.description": "विभिन्न डेटा धाराओं को सामान्यीकृत, सत्यापित और विश्लेषण के लिए तैयार किया जाता है।", "step.analysis.title": "विश्लेषण", "step.analysis.description": "ML मॉडल लागत, समयसीमा, स्थान, एजेंसी और प्रगति का विश्लेषण करते हैं।", "step.score.title": "प्राथमिकता स्कोर", "step.score.description": "भारित संकेतों से व्याख्यात्मक ऑडिट प्राथमिकता स्कोर (0–100) निकाला जाता है।", "step.evidence.title": "साक्ष्य पैक", "step.evidence.description": "हर संकेत के साथ वास्तविक और मानक मानों का ठोस साक्ष्य दिया जाता है।", "step.human.title": "मानव जांच", "step.human.description": "नोडल अधिकारी साक्ष्यों की समीक्षा कर अंतिम निर्णय लेते हैं।",
    "signals.heading": "पाँच पहचान संकेत", "signals.body": "हर संकेत परियोजना डेटा के एक अलग आयाम की जांच करता है। कुछ प्रोटोटाइप में सक्रिय हैं और कुछ भविष्य के विस्तार के लिए हैं।", "signal.cost.name": "लागत असामान्यता पहचान", "signal.cost.description": "समान कार्यों के क्षेत्रीय मानकों से स्वीकृत लागत की तुलना कर असामान्य मानों की पहचान करता है।", "signal.timeline.name": "समयसीमा असामान्यता", "signal.timeline.description": "दायरे और प्रकार के अनुसार अपेक्षित अवधि से अधिक देरी वाली परियोजनाओं को चिह्नित करता है।", "signal.spatial.name": "स्थानिक ओवरलैप पहचान", "signal.spatial.description": "भौगोलिक निकटता वाली संभावित दोहराव या ओवरलैप परियोजनाओं की पहचान करता है।", "signal.agency.name": "एजेंसी जोखिम प्रोफाइल", "signal.agency.description": "व्यवस्थागत पैटर्न दिखाने के लिए कार्यान्वयन एजेंसी के ऐतिहासिक प्रदर्शन को एकत्र करता है।", "signal.progress.name": "प्रगति-भुगतान असंगति", "signal.progress.description": "रिपोर्ट की गई भौतिक प्रगति और दर्ज वित्तीय व्यय के बीच अंतर पहचानता है।",
    "footer.about": "परिचय", "footer.methodology": "कार्यप्रणाली", "footer.dataSources": "डेटा स्रोत", "footer.privacy": "गोपनीयता", "footer.accessibility": "सुलभता", "footer.disclaimer": "स्वतंत्र SIH 2026 प्रोटोटाइप — भारत सरकार का आधिकारिक पोर्टल नहीं।",
  },
} as const;

type TranslationKey = keyof typeof dictionary.en;
type I18nContextValue = { locale: Locale; setLocale: (locale: Locale) => void; t: (key: TranslationKey) => string };
const I18nContext = createContext<I18nContextValue | null>(null);

export function I18nProvider({ children }: { children: ReactNode }) {
  const [locale, setLocale] = useState<Locale>("en");
  const t = (key: TranslationKey) => dictionary[locale][key] ?? dictionary.en[key];
  return createElement(I18nContext.Provider, { value: { locale, setLocale, t } }, children);
}

export function useI18n() {
  const context = useContext(I18nContext);
  if (!context) throw new Error("useI18n must be used within I18nProvider");
  return context;
}