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
    "hero.enter": "Enter Sentinel",
    "hero.explore": "Explore the System",
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
    "score.heading": "Audit Priority Score", "score.body": "A weighted composite of all five signals, producing a traceable score from 0 to 100. Weights are configurable — they reflect current model tuning, not fixed truths.",
    "score.low": "Low", "score.medium": "Medium", "score.high": "High", "score.critical": "Critical", "score.lowDesc": "Normal progression. No anomalies detected.", "score.mediumDesc": "Minor deviations. Worth monitoring but not urgent.", "score.highDesc": "Significant anomalies. Recommended for review.", "score.criticalDesc": "Multiple severe indicators. Prioritize for investigation.", "score.note": "The score prioritizes attention. It does not establish wrongdoing.",
    "evidence.heading": "Why Was This Flagged?", "evidence.intro": "Illustrative example — project ID and data shown for demonstration purposes.", "evidence.critical": "Critical", "evidence.project": "Construction of Community Hall, Belagavi, Karnataka", "evidence.observed": "Observed", "evidence.benchmark": "Benchmark", "evidence.deviation": "Deviation",
    "evidence.cost": "Cost Anomaly", "evidence.payment": "Payment Pattern", "evidence.delay": "Project Delay", "evidence.progress": "Progress-Payment Mismatch",
    "human.heading": "AI Prioritizes. Humans Decide.", "human.body": "Sentinel never auto-declares fraud or triggers punitive action. Every flag is an invitation for a human auditor to examine the evidence. The final determination always rests with authorized officials.", "human.ai": "AI Analysis", "human.pack": "Evidence Pack", "human.review": "Human Review", "human.decision": "Decision",
    "roles.heading": "Who It's For", "roles.body": "Designed for the different roles involved in MPLADS oversight.", "role.district": "District Auditors", "role.districtDesc": "Review flagged projects in their jurisdiction and initiate field verification.", "role.monitoring": "Monitoring Officers", "role.monitoringDesc": "Track investigation progress and ensure timely resolution of flagged cases.", "role.state": "State Nodal Authorities", "role.stateDesc": "Oversee cross-district patterns and coordinate escalation with MoSPI.", "role.mospi": "MoSPI Administrators", "role.mospiDesc": "Access system-wide analytics and manage scheme-level policy configurations.",
    "transparency.heading": "Data Transparency", "transparency.public": "Public & Real Data", "transparency.publicDesc": "Sourced from official MPLADS records and the eSAKSHI portal where publicly available.", "transparency.synthetic": "Synthetic Validation", "transparency.syntheticDesc": "Prototype testing uses clearly-labelled synthetic data that mimics real-world patterns.", "transparency.provenance": "Evidence Provenance", "transparency.provenanceDesc": "Every result is traceable to its source record — no black-box outputs.",
    "responsible.heading": "Responsible AI & Limitations", "responsible.one": "An anomaly is not evidence of fraud. It is a statistical signal that warrants human review.", "responsible.two": "Every investigation requires a qualified human auditor to examine the evidence and make a determination.", "responsible.three": "Real-world data is always distinguished from synthetic validation data within the platform.", "responsible.four": "Sentinel is an analytical layer — it does not have enforcement authority or access to classified data.",
    "cta.heading": "Turn Project Data Into Actionable Audit Priorities", "cta.body": "AI-assisted · Evidence-backed · Human-led.",
  },
  hi: {
    "topStrip": "भारत सरकार · MPLADS निगरानी", "fontSize": "फ़ॉन्ट आकार:",
    "nav.home": "होम", "nav.about": "योजना के बारे में", "nav.howItWorks": "यह कैसे काम करता है", "nav.signals": "पता लगाने के संकेत", "nav.dashboard": "डैशबोर्ड",
    "header.government": "भारत सरकार", "header.brand": "MPLADS सेंटिनल", "header.tagline": "AI ऑडिट प्राथमिकता · SIH 2026", "header.login": "लॉग इन",
    "hero.headline": "MPLADS सेंटिनल: बेहतर निगरानी", "hero.pitch": "AI के साथ MPLADS निगरानी को प्रतिक्रियात्मक ऑडिट से सक्रिय निर्णय-सहायता में बदलना।", "hero.enter": "सेंटिनल में प्रवेश करें", "hero.explore": "सिस्टम देखें", "hero.howItWorks": "यह कैसे काम करता है देखें", "hero.trust": "व्याख्यात्मक AI · मानव निगरानी · साक्ष्य-आधारित",
    "stats.projects": "ट्रैक की गई परियोजनाएँ", "stats.states": "कवर किए गए राज्य और केंद्रशासित प्रदेश", "stats.signals": "सक्रिय पहचान संकेत", "stats.flagged": "चिह्नित परियोजनाएँ",
    "overview.heading": "MPLADS को समझना", "overview.body": "सांसद स्थानीय क्षेत्र विकास योजना (MPLADS) 23 दिसंबर 1993 को शुरू की गई थी। इसके तहत सांसद अपने निर्वाचन क्षेत्रों में स्थानीय आवश्यकताओं के आधार पर विकास कार्यों की सिफारिश कर सकते हैं। प्रत्येक सांसद को ₹5 करोड़ का वार्षिक आवंटन मिलता है, जिसका प्रशासन सांख्यिकी और कार्यक्रम कार्यान्वयन मंत्रालय (MoSPI) करता है।",
    "problem.heading": "चुनौती डेटा की कमी नहीं है। चुनौती यह जानना है कि पहले कहाँ देखना है।", "problem.body": "भारत में 24,000 से अधिक सक्रिय MPLADS परियोजनाओं और सीमित ऑडिट क्षमता के कारण हर परियोजना की मैन्युअल समीक्षा व्यावहारिक नहीं है। पारंपरिक निगरानी में विलंबित ऑडिट पर निर्भरता रहती है। सेंटिनल परियोजनाओं के बड़े समूह को साक्ष्य-आधारित ऑडिट प्राथमिकता सूची में बदलता है, ताकि ऑडिटर सबसे महत्वपूर्ण मामलों पर ध्यान दे सकें।", "problem.note": "सेंटिनल ध्यान को प्राथमिकता देता है — यह गलत कार्य स्थापित नहीं करता।",
    "how.heading": "सेंटिनल कैसे काम करता है", "how.body": "कच्चे डेटा से मानव जांच तक छह चरणों की प्रक्रिया, जिसमें हर चरण में पूरी traceability है।",
    "step.data.title": "डेटा स्रोत", "step.data.description": "सार्वजनिक MPLADS परियोजना रिकॉर्ड, व्यय डेटा और कार्यान्वयन रिपोर्ट।", "step.ingestion.title": "डेटा ग्रहण", "step.ingestion.description": "विभिन्न डेटा धाराओं को सामान्यीकृत, सत्यापित और विश्लेषण के लिए तैयार किया जाता है।", "step.analysis.title": "विश्लेषण", "step.analysis.description": "ML मॉडल लागत, समयसीमा, स्थान, एजेंसी और प्रगति का विश्लेषण करते हैं।", "step.score.title": "प्राथमिकता स्कोर", "step.score.description": "भारित संकेतों से व्याख्यात्मक ऑडिट प्राथमिकता स्कोर (0–100) निकाला जाता है।", "step.evidence.title": "साक्ष्य पैक", "step.evidence.description": "हर संकेत के साथ वास्तविक और मानक मानों का ठोस साक्ष्य दिया जाता है।", "step.human.title": "मानव जांच", "step.human.description": "नोडल अधिकारी साक्ष्यों की समीक्षा कर अंतिम निर्णय लेते हैं।",
    "signals.heading": "पाँच पहचान संकेत", "signals.body": "हर संकेत परियोजना डेटा के एक अलग आयाम की जांच करता है। कुछ प्रोटोटाइप में सक्रिय हैं और कुछ भविष्य के विस्तार के लिए हैं।", "signal.cost.name": "लागत असामान्यता पहचान", "signal.cost.description": "समान कार्यों के क्षेत्रीय मानकों से स्वीकृत लागत की तुलना कर असामान्य मानों की पहचान करता है।", "signal.timeline.name": "समयसीमा असामान्यता", "signal.timeline.description": "दायरे और प्रकार के अनुसार अपेक्षित अवधि से अधिक देरी वाली परियोजनाओं को चिह्नित करता है।", "signal.spatial.name": "स्थानिक ओवरलैप पहचान", "signal.spatial.description": "भौगोलिक निकटता वाली संभावित दोहराव या ओवरलैप परियोजनाओं की पहचान करता है।", "signal.agency.name": "एजेंसी जोखिम प्रोफाइल", "signal.agency.description": "व्यवस्थागत पैटर्न दिखाने के लिए कार्यान्वयन एजेंसी के ऐतिहासिक प्रदर्शन को एकत्र करता है।", "signal.progress.name": "प्रगति-भुगतान असंगति", "signal.progress.description": "रिपोर्ट की गई भौतिक प्रगति और दर्ज वित्तीय व्यय के बीच अंतर पहचानता है।",
    "footer.about": "परिचय", "footer.methodology": "कार्यप्रणाली", "footer.dataSources": "डेटा स्रोत", "footer.privacy": "गोपनीयता", "footer.accessibility": "सुलभता", "footer.disclaimer": "स्वतंत्र SIH 2026 प्रोटोटाइप — भारत सरकार का आधिकारिक पोर्टल नहीं।",
    "score.heading": "ऑडिट प्राथमिकता स्कोर", "score.body": "पाँचों संकेतों का भारित संयोजन, जो 0 से 100 तक एक ट्रेस करने योग्य स्कोर देता है। भार समायोजित किए जा सकते हैं — वे वर्तमान मॉडल ट्यूनिंग दर्शाते हैं, स्थायी सत्य नहीं।", "score.low": "कम", "score.medium": "मध्यम", "score.high": "उच्च", "score.critical": "गंभीर", "score.lowDesc": "सामान्य प्रगति। कोई असामान्यता नहीं मिली।", "score.mediumDesc": "छोटे विचलन। निगरानी योग्य, पर तत्काल नहीं।", "score.highDesc": "महत्वपूर्ण असामान्यताएँ। समीक्षा की अनुशंसा।", "score.criticalDesc": "कई गंभीर संकेत। जांच को प्राथमिकता दें।", "score.note": "स्कोर ध्यान को प्राथमिकता देता है। यह गलत कार्य स्थापित नहीं करता।",
    "evidence.heading": "इसे चिह्नित क्यों किया गया?", "evidence.intro": "उदाहरण — परियोजना ID और डेटा केवल प्रदर्शन के लिए हैं।", "evidence.critical": "गंभीर", "evidence.project": "सामुदायिक भवन का निर्माण, बेलगावी, कर्नाटक", "evidence.observed": "देखा गया", "evidence.benchmark": "मानक", "evidence.deviation": "विचलन", "evidence.cost": "लागत असामान्यता", "evidence.payment": "भुगतान पैटर्न", "evidence.delay": "परियोजना में देरी", "evidence.progress": "प्रगति-भुगतान असंगति",
    "human.heading": "AI प्राथमिकता देता है। मनुष्य निर्णय लेते हैं।", "human.body": "सेंटिनल कभी भी स्वतः धोखाधड़ी घोषित या दंडात्मक कार्रवाई शुरू नहीं करता। हर संकेत मानव ऑडिटर को साक्ष्य की जांच का निमंत्रण है। अंतिम निर्णय अधिकृत अधिकारियों का होता है।", "human.ai": "AI विश्लेषण", "human.pack": "साक्ष्य पैक", "human.review": "मानव समीक्षा", "human.decision": "निर्णय",
    "roles.heading": "यह किनके लिए है", "roles.body": "MPLADS निगरानी में शामिल विभिन्न भूमिकाओं के लिए बनाया गया।", "role.district": "जिला ऑडिटर", "role.districtDesc": "अपने क्षेत्र की चिह्नित परियोजनाओं की समीक्षा और क्षेत्रीय सत्यापन शुरू करें।", "role.monitoring": "निगरानी अधिकारी", "role.monitoringDesc": "जांच की प्रगति पर नज़र रखें और मामलों का समय पर समाधान सुनिश्चित करें।", "role.state": "राज्य नोडल प्राधिकरण", "role.stateDesc": "जिला-पार पैटर्न की निगरानी करें और MoSPI के साथ समन्वय करें।", "role.mospi": "MoSPI प्रशासक", "role.mospiDesc": "प्रणालीगत विश्लेषण देखें और योजना-स्तरीय नीतिगत कॉन्फ़िगरेशन प्रबंधित करें।",
    "transparency.heading": "डेटा पारदर्शिता", "transparency.public": "सार्वजनिक और वास्तविक डेटा", "transparency.publicDesc": "जहाँ उपलब्ध हो, आधिकारिक MPLADS रिकॉर्ड और eSAKSHI पोर्टल से लिया गया।", "transparency.synthetic": "सिंथेटिक सत्यापन", "transparency.syntheticDesc": "प्रोटोटाइप परीक्षण में वास्तविक दुनिया के पैटर्न जैसा स्पष्ट रूप से चिह्नित सिंथेटिक डेटा है।", "transparency.provenance": "साक्ष्य स्रोत", "transparency.provenanceDesc": "हर परिणाम अपने स्रोत रिकॉर्ड से ट्रेस किया जा सकता है — कोई ब्लैक बॉक्स आउटपुट नहीं।",
    "responsible.heading": "जिम्मेदार AI और सीमाएँ", "responsible.one": "असामान्यता धोखाधड़ी का प्रमाण नहीं है। यह मानव समीक्षा योग्य एक सांख्यिकीय संकेत है।", "responsible.two": "हर जांच में योग्य मानव ऑडिटर साक्ष्य की समीक्षा कर निर्णय लेता है।", "responsible.three": "प्लेटफ़ॉर्म में वास्तविक डेटा को सिंथेटिक सत्यापन डेटा से हमेशा अलग दिखाया जाता है।", "responsible.four": "सेंटिनल एक विश्लेषणात्मक परत है — इसके पास प्रवर्तन अधिकार या वर्गीकृत डेटा तक पहुंच नहीं है।", "cta.heading": "परियोजना डेटा को कार्रवाई योग्य ऑडिट प्राथमिकताओं में बदलें", "cta.body": "AI-सहायता · साक्ष्य-आधारित · मानव-नेतृत्व।",
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