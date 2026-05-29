"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useScroll, useSpring, useTransform } from "framer-motion";
import styles from "./customisation-studio.module.css";

type ProductOption = {
  sku: string;
  label: string;
  type: "bottle" | "jar";
};

const PRODUCT_OPTIONS: ProductOption[] = [
  { sku: "WB-500", label: "Water Bottle", type: "bottle" },
  { sku: "JB-300", label: "Juice Bottle", type: "bottle" },
  { sku: "MB-350", label: "Milkshake Bottle", type: "bottle" },
  { sku: "SJ-900", label: "Storage Jar", type: "jar" },
  { sku: "MJ-700", label: "Mason Jar", type: "jar" },
  { sku: "SPJ-180", label: "Spice Jar", type: "jar" },
];

const CUSTOMISATION_CARDS = [
  { title: "Logo Printing", description: "Precision placement with sharp detail." },
  { title: "Frosted Glass", description: "Soft touch clarity with premium diffusion." },
  { title: "Color Coating", description: "Controlled tones matched to brand language." },
  { title: "Metallic Foiling", description: "High-contrast accents that catch attention." },
  { title: "Premium Caps", description: "Elevated closure systems and tactile finishes." },
  { title: "Ceramic Printing", description: "Durable visual identity for long use cycles." },
  { title: "Luxury Finishes", description: "Texture, sheen, and depth for shelf dominance." },
  { title: "Gift Packaging", description: "Retail-ready presentations built for recall." },
];

const TIMELINE = [
  "Choose Product",
  "Upload Logo",
  "Receive Mockup",
  "Approve Design",
  "Production",
  "Delivery",
];

const INSPIRATION = [
  "Luxury Water",
  "Cold Coffee",
  "Milkshake",
  "Hotel Bottle",
  "Dessert Jar",
  "Gift Packaging",
];

function BottleVisual({
  type,
  branded = false,
  brandLabel,
}: {
  type: "bottle" | "jar";
  branded?: boolean;
  brandLabel?: string;
}) {
  return (
    <div className={`${styles.glassVisual} ${type === "jar" ? styles.jarVisual : styles.bottleVisual}`}>
      <div className={styles.glassNeck} />
      <div className={styles.glassBody}>
        <div className={styles.glassShine} />
        <div className={styles.glassShineSecondary} />
        <div className={`${styles.glassLabel} ${branded ? styles.glassLabelVisible : ""}`}>
          <span>{brandLabel || "YOUR BRAND"}</span>
        </div>
      </div>
      <div className={styles.glassShadow} />
    </div>
  );
}

function CounterStat({
  value,
  suffix = "",
  title,
}: {
  value: number;
  suffix?: string;
  title: string;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const inView = useInView(ref, { once: true, amount: 0.45 });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!inView) return;
    let frame = 0;
    const totalFrames = 42;
    const timer = window.setInterval(() => {
      frame += 1;
      const progress = frame / totalFrames;
      const eased = 1 - Math.pow(1 - progress, 3);
      setCount(Math.round(value * eased));
      if (frame >= totalFrames) {
        window.clearInterval(timer);
      }
    }, 24);
    return () => window.clearInterval(timer);
  }, [inView, value]);

  return (
    <div ref={ref} className={styles.metricCard}>
      <p className={styles.metricValue}>
        {count}
        {suffix}
      </p>
      <p className={styles.metricTitle}>{title}</p>
    </div>
  );
}

function StaticStat({ value, title }: { value: string; title: string }) {
  return (
    <div className={styles.metricCard}>
      <p className={styles.metricValue}>{value}</p>
      <p className={styles.metricTitle}>{title}</p>
    </div>
  );
}

export function CustomisationStudio() {
  const heroRef = useRef<HTMLElement | null>(null);
  const [slider, setSlider] = useState(50);
  const [selectedProductSku, setSelectedProductSku] = useState(PRODUCT_OPTIONS[0].sku);
  const [brandName, setBrandName] = useState("");
  const [notes, setNotes] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [logoFile, setLogoFile] = useState<File | null>(null);
  const [dragging, setDragging] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const selectedProduct = useMemo(
    () => PRODUCT_OPTIONS.find((item) => item.sku === selectedProductSku) ?? PRODUCT_OPTIONS[0],
    [selectedProductSku],
  );

  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const smoothProgress = useSpring(scrollYProgress, { damping: 24, stiffness: 120 });
  const bottleY = useTransform(smoothProgress, [0, 1], [0, -90]);
  const bottleRotate = useTransform(smoothProgress, [0, 1], [0, 9]);
  const bottleScale = useTransform(smoothProgress, [0, 1], [1, 0.9]);
  const brandedOpacity = useTransform(smoothProgress, [0, 0.55, 1], [0.06, 0.42, 1]);

  function onFileChange(file: File | null) {
    if (!file) return;
    setLogoFile(file);
    setSubmitError("");
  }

  function onDrop(event: React.DragEvent<HTMLLabelElement>) {
    event.preventDefault();
    setDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) onFileChange(file);
  }

  async function handleMockupSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmitError("");
    if (!logoFile) {
      setSubmitError("Please upload your logo before submitting.");
      return;
    }
    setSubmitting(true);

    try {
      const payload = new FormData();
      payload.append("selected_sku", selectedProduct.sku);
      payload.append("selected_product", selectedProduct.label);
      payload.append("brand_name", brandName.trim());
      payload.append("contact_name", contactName.trim());
      payload.append("contact_email", contactEmail.trim());
      payload.append("contact_phone", contactPhone.trim());
      payload.append("additional_notes", notes.trim());
      payload.append("logo_file", logoFile);

      const response = await fetch("/api/mockup-requests", {
        method: "POST",
        body: payload,
      });
      const data = (await response.json()) as { error?: string; message?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Unable to submit your request right now.");
      }

      setSubmitted(true);
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : "Unable to submit your request right now.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className={styles.page}>
      <section ref={heroRef} className={styles.hero}>
        <div className={styles.heroGlow} />
        <div className={styles.heroInner}>
          <motion.div
            className={styles.heroVisual}
            style={{ y: bottleY, rotateZ: bottleRotate, scale: bottleScale }}
            animate={{ rotateY: [0, 6, 0] }}
            transition={{ duration: 14, repeat: Infinity, ease: "easeInOut" }}
          >
            <div className={styles.heroBottleShell}>
              <BottleVisual type="bottle" branded={false} />
              <motion.div className={styles.heroBottleBrandOverlay} style={{ opacity: brandedOpacity }}>
                <BottleVisual type="bottle" branded brandLabel={brandName || "CLEARPIECE STUDIO"} />
              </motion.div>
            </div>
          </motion.div>

          <motion.div
            className={styles.heroCopy}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.9, ease: [0.2, 0.8, 0.2, 1] }}
          >
            <p className={styles.eyebrow}>Customisation Studio</p>
            <h1>
              YOUR BRAND.
              <br />
              ON GLASS.
            </h1>
            <p className={styles.heroSub}>
              Design.
              <br />
              Mockup.
              <br />
              Production.
              <br />
              All under one roof.
            </p>
            <div className={styles.heroActions}>
              <a href="#mockup-studio" className={styles.primaryBtn}>
                Create Free Mockup
              </a>
              <a href="#customisation-grid" className={styles.secondaryBtn}>
                Explore Customisation
              </a>
            </div>
          </motion.div>
        </div>
      </section>

      <section className={styles.section}>
        <motion.div
          className={styles.container}
          initial={{ opacity: 0, y: 26 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.35 }}
          transition={{ duration: 0.8, ease: [0.2, 0.8, 0.2, 1] }}
        >
          <h2>From Generic To Memorable</h2>
          <p className={styles.sectionCaption}>Slide to reveal each branded layer.</p>

          <div className={styles.comparisonShell}>
            <div className={styles.comparisonTrack}>
              <div className={styles.comparisonBefore}>
                <BottleVisual type="bottle" />
              </div>
              <div className={styles.comparisonAfter} style={{ clipPath: `inset(0 ${100 - slider}% 0 0)` }}>
                <BottleVisual type="bottle" branded brandLabel={brandName || "AQUA LUXE"} />
              </div>
              <div className={styles.compareDivider} style={{ left: `${slider}%` }} />
            </div>
            <input
              className={styles.sliderInput}
              type="range"
              min={0}
              max={100}
              value={slider}
              onChange={(event) => setSlider(Number(event.target.value))}
              aria-label="Transformation slider"
            />
          </div>

          <div className={styles.stepPills}>
            {["Logo", "Frosting", "Color Coating", "Foiling"].map((item, index) => {
              const threshold = (index + 1) * 20;
              const active = slider >= threshold;
              return (
                <span key={item} className={`${styles.stepPill} ${active ? styles.stepPillActive : ""}`}>
                  {item}
                </span>
              );
            })}
          </div>
        </motion.div>
      </section>

      <section id="customisation-grid" className={styles.section}>
        <div className={styles.container}>
          <h2>What We Can Customise</h2>
          <div className={styles.customGrid}>
            {CUSTOMISATION_CARDS.map((card, index) => (
              <motion.article
                key={card.title}
                className={styles.customCard}
                initial={{ opacity: 0, y: 16 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, amount: 0.25 }}
                transition={{ delay: index * 0.03, duration: 0.5 }}
              >
                <div className={styles.customCardVisual} />
                <h3>{card.title}</h3>
                <p>{card.description}</p>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.designStudio}>
            <div>
              <p className={styles.eyebrow}>Free Design Studio</p>
              <h2>
                No Designer?
                <br />
                We&apos;ve Got You.
              </h2>
              <p className={styles.designStatement}>
                For orders above 1000 pcs, our design team helps create your packaging concept at no cost.
              </p>
            </div>
            <div className={styles.designCards}>
              {["Logo Placement", "Brand Styling", "Print Layout"].map((item) => (
                <div key={item} className={styles.designCard}>
                  {item}
                </div>
              ))}
              <span className={styles.freeBadge}>FREE ABOVE MOQ</span>
            </div>
          </div>
        </div>
      </section>

      <section id="mockup-studio" className={styles.section}>
        <div className={styles.container}>
          <h2>See Your Brand Before Production</h2>
          <div className={styles.mockupLayout}>
            <form className={styles.mockupForm} onSubmit={handleMockupSubmit}>
              <div className={styles.formStep}>
                <p className={styles.stepTitle}>Step 1 - Select Product</p>
                <div className={styles.productChoices}>
                  {PRODUCT_OPTIONS.map((option) => (
                    <button
                      key={option.sku}
                      type="button"
                      className={`${styles.productChip} ${selectedProductSku === option.sku ? styles.productChipActive : ""}`}
                      onClick={() => setSelectedProductSku(option.sku)}
                    >
                      <span>{option.label}</span>
                      <small>{option.sku}</small>
                    </button>
                  ))}
                </div>
              </div>

              <div className={styles.formStep}>
                <p className={styles.stepTitle}>Step 2 - Upload Logo</p>
                <label
                  className={`${styles.uploadZone} ${dragging ? styles.uploadZoneDragging : ""}`}
                  onDragOver={(event) => {
                    event.preventDefault();
                    setDragging(true);
                  }}
                  onDragLeave={() => setDragging(false)}
                  onDrop={onDrop}
                >
                  <input
                    type="file"
                    accept=".png,.svg,.jpg,.jpeg,.pdf"
                    onChange={(event) => onFileChange(event.target.files?.[0] ?? null)}
                  />
                  <span>{logoFile ? logoFile.name : "Drop logo file or click to upload"}</span>
                  <small>Accepted: PNG, SVG, JPG, PDF</small>
                </label>
              </div>

              <div className={styles.formStep}>
                <p className={styles.stepTitle}>Step 3 - Brand Name</p>
                <input
                  type="text"
                  required
                  value={brandName}
                  onChange={(event) => setBrandName(event.target.value)}
                  placeholder="Your brand name"
                />
              </div>

              <div className={styles.formSplit}>
                <div className={styles.formStep}>
                  <p className={styles.stepTitle}>Contact Name</p>
                  <input
                    type="text"
                    required
                    value={contactName}
                    onChange={(event) => setContactName(event.target.value)}
                    placeholder="Full name"
                  />
                </div>
                <div className={styles.formStep}>
                  <p className={styles.stepTitle}>Contact Phone</p>
                  <input
                    type="tel"
                    required
                    value={contactPhone}
                    onChange={(event) => setContactPhone(event.target.value)}
                    placeholder="+91"
                  />
                </div>
              </div>

              <div className={styles.formStep}>
                <p className={styles.stepTitle}>Contact Email</p>
                <input
                  type="email"
                  required
                  value={contactEmail}
                  onChange={(event) => setContactEmail(event.target.value)}
                  placeholder="you@brand.com"
                />
              </div>

              <div className={styles.formStep}>
                <p className={styles.stepTitle}>Step 4 - Additional Notes</p>
                <textarea
                  rows={4}
                  value={notes}
                  onChange={(event) => setNotes(event.target.value)}
                  placeholder="Finish, mood, references, and packaging intent."
                />
              </div>

              {submitError ? <p className={styles.errorText}>{submitError}</p> : null}
              {submitted ? (
                <motion.div
                  className={styles.successState}
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.45 }}
                >
                  Your mockup request is being prepared.
                </motion.div>
              ) : (
                <>
                  <button type="submit" className={styles.primaryBtn} disabled={submitting}>
                    {submitting ? "Submitting..." : "Create My Mockup"}
                  </button>
                  <p className={styles.deliveryNote}>Delivered within 4 working hours</p>
                </>
              )}
            </form>

            <div className={styles.previewPanel}>
              <p className={styles.previewLabel}>Live Preview</p>
              <div className={styles.previewGlass}>
                <BottleVisual type={selectedProduct.type} branded={Boolean(brandName)} brandLabel={brandName || "YOUR BRAND"} />
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>How It Works</h2>
          <div className={styles.timeline}>
            {TIMELINE.map((item, index) => (
              <div key={item} className={styles.timelineStep}>
                <span>{String(index + 1).padStart(2, "0")}</span>
                <p>{item}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.consultSection}`}>
        <div className={styles.container}>
          <p className={styles.eyebrow}>Packaging Consultation</p>
          <h2>Not Sure What Fits Your Brand?</h2>
          <p className={styles.consultCopy}>
            We help brands choose the right bottle, branding style, finish, cap, and packaging direction.
          </p>
          <a href="#mockup-studio" className={styles.primaryBtn}>
            Book Consultation
          </a>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <h2>Packaging Inspiration</h2>
          <div className={styles.masonry}>
            {INSPIRATION.map((item, index) => (
              <motion.article
                key={item}
                className={styles.masonryCard}
                initial={{ opacity: 0, scale: 0.97 }}
                whileInView={{ opacity: 1, scale: 1 }}
                viewport={{ once: true, amount: 0.2 }}
                transition={{ duration: 0.5, delay: index * 0.04 }}
              >
                <div className={styles.masonryOverlay}>
                  <p>{item}</p>
                </div>
              </motion.article>
            ))}
          </div>
        </div>
      </section>

      <section className={styles.section}>
        <div className={styles.container}>
          <div className={styles.metricsGrid}>
            <CounterStat value={1000} suffix="+" title="Design Support Included" />
            <CounterStat value={4} title="Hours Mockup Turnaround" />
            <CounterStat value={1000} suffix=" pcs" title="Free Design Eligibility" />
            <StaticStat value="Fast" title="Production & Sampling" />
          </div>
        </div>
      </section>

      <section className={`${styles.section} ${styles.finalCta}`}>
        <div className={styles.container}>
          <div className={styles.finalCtaInner}>
            <BottleVisual type="bottle" branded brandLabel={brandName || "CLEARPIECE"} />
            <div>
              <h2>
                Let&apos;s Build Packaging
                <br />
                People Remember
              </h2>
              <p>
                Upload your logo and receive your first branded concept within 4 working hours.
              </p>
              <a href="#mockup-studio" className={styles.primaryBtn}>
                Create Free Mockup
              </a>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
