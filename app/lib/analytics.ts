// Google Analytics Setup
// Add this to your environment variables:
// NEXT_PUBLIC_GA_MEASUREMENT_ID=G-XXXXXXXXXX

export const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;

// Track page views
export const pageview = (url: string) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("config", GA_MEASUREMENT_ID, {
      page_path: url,
    });
  }
};

// Track events
type GTagEvent = {
  action: string;
  category: string;
  label: string;
  value?: number;
};

export const event = ({ action, category, label, value }: GTagEvent) => {
  if (typeof window !== "undefined" && (window as any).gtag) {
    (window as any).gtag("event", action, {
      event_category: category,
      event_label: label,
      value: value,
    });
  }
};

// Track form submissions
export const trackFormSubmission = (formName: string) => {
  event({
    action: "submit",
    category: "Form",
    label: formName,
  });
};

// Track contact button clicks
export const trackContactClick = (location: string) => {
  event({
    action: "click",
    category: "Contact",
    label: location,
  });
};

// Track navigation
export const trackNavigation = (destination: string) => {
  event({
    action: "navigate",
    category: "Navigation",
    label: destination,
  });
};
