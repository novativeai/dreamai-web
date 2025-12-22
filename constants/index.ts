/**
 * Application constants for DreamAI Next.js app
 * Adapted from Expo React Native version
 */

import { StyleOption, StyleCategory, DeletionFlowView } from "@/types";

// --- Core App Info ---
export const APP_NAME = "DreamAI";
export const BRAND_COLOR = "#FF5069";
export const WHITE_BG = "#F7F7F7";
export const APP_VERSION = "1.0";
export const FOOTER_TEXT = "Made with love in Switzerland";

// --- API Configuration ---
export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://dreamai-production.up.railway.app";

// --- Helper Function: Hex to RGB string ---
const hexToRgbString = (hex: string): string => {
  let r = "0", g = "0", b = "0";
  if (hex.length === 4) {
    r = "0x" + hex[1] + hex[1];
    g = "0x" + hex[2] + hex[2];
    b = "0x" + hex[3] + hex[3];
  } else if (hex.length === 7) {
    r = "0x" + hex[1] + hex[2];
    g = "0x" + hex[3] + hex[4];
    b = "0x" + hex[5] + hex[6];
  }
  return `${+r}, ${+g}, ${+b}`;
};

// --- BASE COLORS ---
const BASE_HEX_HIGHLIGHT = "#007AFF";
const BASE_HEX_NEUTRAL_LIGHT = "#FFFFFF";
const BASE_HEX_NEUTRAL_DARK_BASE_FOR_OPACITY = "#000000";

// --- TYPOGRAPHY ---
const typography = {
  heading: {
    h1: { fontSize: 24, lineHeight: Math.round(24 * 1.3) },
    h2: { fontSize: 18, lineHeight: Math.round(18 * 1.3) },
    h3: { fontSize: 16, lineHeight: Math.round(16 * 1.3) },
    h4: { fontSize: 14, lineHeight: Math.round(14 * 1.3) },
    h5: { fontSize: 12, lineHeight: Math.round(12 * 1.3) },
  },
  body: {
    xl: { fontSize: 18, lineHeight: 24 },
    l: { fontSize: 16, lineHeight: 22 },
    m: { fontSize: 14, lineHeight: 20 },
    s: { fontSize: 12, lineHeight: 16 },
    xs: { fontSize: 10, lineHeight: 14 },
  },
  action: {
    l: { fontSize: 14, lineHeight: Math.round(14 * 1.25) },
    m: { fontSize: 12, lineHeight: Math.round(12 * 1.25) },
    s: { fontSize: 10, lineHeight: Math.round(10 * 1.25) },
  },
  caption: {
    m: { fontSize: 10, lineHeight: Math.round(10 * 1.25) },
  },
};

// --- COLORS ---
const colors = {
  highlight: {
    darkest: `rgba(${hexToRgbString(BASE_HEX_HIGHLIGHT)}, 1)`,
    dark: `rgba(${hexToRgbString(BASE_HEX_HIGHLIGHT)}, 0.85)`,
    medium: `rgba(${hexToRgbString(BASE_HEX_HIGHLIGHT)}, 0.65)`,
    light: `rgba(${hexToRgbString(BASE_HEX_HIGHLIGHT)}, 0.35)`,
    lightest: `rgba(${hexToRgbString(BASE_HEX_HIGHLIGHT)}, 0.15)`,
  },
  neutral: {
    light: {
      darkest: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_LIGHT)}, 1)`,
      dark: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_LIGHT)}, 0.87)`,
      medium: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_LIGHT)}, 0.60)`,
      light: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_LIGHT)}, 0.30)`,
      lightest: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_LIGHT)}, 0.12)`,
    },
    dark: {
      darkest: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_DARK_BASE_FOR_OPACITY)}, 0.80)`,
      dark: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_DARK_BASE_FOR_OPACITY)}, 0.65)`,
      medium: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_DARK_BASE_FOR_OPACITY)}, 0.50)`,
      light: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_DARK_BASE_FOR_OPACITY)}, 0.30)`,
      lightest: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_DARK_BASE_FOR_OPACITY)}, 0.18)`,
    },
  },
  support: {
    success: { dark: "#34C759", medium: "#30D158", light: "#AAF0D1" },
    warning: { dark: "#FF9F0A", medium: "#FFB347", light: "#FFDAB9" },
    error: { dark: "#FF453A", medium: "#FF6B6B", light: "#FFCCCB" },
  },
  background: "#000000",
  text: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_LIGHT)}, 0.87)`,
  textSecondary: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_LIGHT)}, 0.60)`,
  border: `rgba(${hexToRgbString(BASE_HEX_NEUTRAL_DARK_BASE_FOR_OPACITY)}, 0.30)`,
};

// --- SPACING & LAYOUT ---
const spacing = {
  xxs: 4,
  xs: 8,
  s: 12,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 48,
};

const layout = {
  screenPaddingHorizontal: spacing.l,
  screenPaddingVertical: spacing.m,
};

const borderRadius = {
  s: 4,
  m: 8,
  l: 16,
  xl: 24,
  round: 999,
};

// --- EXPORT THEME ---
export const AppTheme = {
  colors,
  typography,
  spacing,
  layout,
  borderRadius,
};

// --- Terms & Disclaimer ---
export const TERMS_SCREEN_TAGLINE = "See yourself with the dreamlife you always wanted";
export const TERMS_SCREEN_TITLE = "Disclaimer & Consent";

export const DISCLAIMER_BULLET_POINTS = [
  "This app is intended for users aged 18 and over only. By using it, you confirm that you are of legal age.",
  "All images are generated using artificial intelligence and are not real. Misuse, deception, impersonation, or presenting AI-generated content as real is strictly prohibited.",
  "You may only upload images for which you hold full rights. Third parties may not be depicted without their explicit consent. Depicting real individuals without their consent – even in altered, artificial, or recreated form – is strictly forbidden.",
  "It is strictly prohibited to upload images that depict minors, violence, nudity, sexual acts, or copyrighted material without proper authorization.",
  "Your data and images are processed in accordance with our Privacy Policy.",
  "You are solely responsible for the use, sharing, and distribution of all AI-generated content created within the app. Any use outside the app – especially in connection with deception, impersonation, or illegal content – is strictly prohibited and entirely at your own risk.",
  "The app does not verify or guarantee that the generated content is legally valid or permitted for any specific purpose. The app assumes no liability for any misuse, harm, or legal violations resulting from the creation, use, or distribution of generated content.",
  "By using this app, you agree to our Terms of Use.",
];

export const CHECKBOX_1_TEXT = {
  prefix: "I have read and accepted the ",
  termsLink: "Terms of Use",
  midfix: ", the ",
  privacyLink: "Privacy Policy",
  suffix: ", and the Cookie Policy.",
};

export const CHECKBOX_2_TEXT = "I understand that all content is artificially generated and no real persons may be depicted without consent. The depicted person must be at least 18 years old.";

// --- Asset Paths (for Next.js public folder) ---
export const LOGIN_BACKGROUND_IMAGE = "/assets/images/BACKGROUND.png";
export const TERMS_BACKGROUND_IMAGE = "/assets/images/STARS.png";
export const PLACEHOLDER_IMAGE = "/assets/icons/UPLOAD.png";
export const PREMIUM_ICON = "/assets/icons/CROWN.png";
export const GENERATE_ICON = "/assets/icons/GENERATE.png";
export const AGE_BLOCKED_IMAGE = "/assets/images/ROBOT.png";
export const APP_LOGO = "/assets/images/LOGO_BLACK.png";
export const APP_LOGO_WHITE = "/assets/images/LOGO_WHITE.png";
export const SHARE_ICON = "/assets/icons/SHARE.png";
export const DOWNLOAD_ICON = "/assets/icons/DOWNLOAD.png";
export const MAIL_ICON = "/assets/icons/MAIL.png";
export const GOOGLE_ICON = "/assets/icons/GOOGLE.png";
export const POPUP_IMAGE = "/assets/images/POPUP.png";

// --- Style Categories ---
export const STYLE_CATEGORIES: { [key: string]: StyleCategory } = {
  desired: {
    label: "Desired",
    options: [
      { key: "desired-loved-look", title: "Loved Look", prompt: "Add one person in the background, 1.5 meters away, looking toward the main subject with warm, affectionate expression and soft smile. Change the background to a softly lit indoor space with warm ambient lighting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to appear relaxed and receptive, with a gentle welcoming posture fitting the romantic atmosphere. Slight bokeh effect on the background person. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-bar-flirt", title: "Bar Flirt", prompt: "Change the background to an upscale cocktail lounge with warm amber lighting, wooden bar counter, and bottles on backlit shelves. Add one person at the bar, 2 meters away, leaning slightly toward the main subject with subtle smile. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to lean casually against the bar with confident, flirtatious body language. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-rooftop-romance", title: "Rooftop Romance", prompt: "Change the background to a modern rooftop terrace at twilight with city lights glowing in the distance, string lights overhead, and elegant outdoor furniture. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to appear romantically relaxed, perhaps leaning on the railing gazing at the view or seated elegantly. Professional romantic photography aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-birthday-celeb", title: "Birthday Celebration", prompt: "Change the background to a stylish party venue with colorful balloons, confetti in the air, and a birthday cake on a nearby table. Add 4-5 diverse people in the background positioned in a semi-circle, all looking toward the main subject with joyful expressions and raised glasses. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to show celebration - arms raised joyfully or holding a glass with an excited, happy expression. Sharper focus on the main subject. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-hand-in-hand", title: "Hand-in-Hand", prompt: "Add one person standing beside the main subject at a respectful distance, with hands gently connected between them. Change the background to a scenic outdoor location like a beach boardwalk or park path at golden hour. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to walk naturally alongside their partner with relaxed romantic posture. Warm sunset backlight creating soft rim lighting. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
      { key: "desired-many-friends", title: "Surrounded by Friends", prompt: "Change the background to a lively social gathering space with modern decor and warm lighting. Add 6-8 diverse people surrounding the main subject in a casual circle, all with warm smiles and engaged body language directed toward the center. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to be animated and engaged, gesturing naturally while socializing with friends. Sharper focus on the main subject with slight depth of field blur on the surrounding people. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-selfie-crowd", title: "Selfie Crowd", prompt: "Add 5-6 people gathered closely behind and beside the main subject, all looking toward an implied camera with excited expressions, some with phones raised. Change the background to an indoor event space or trendy venue with modern lighting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to hold arm extended forward taking a selfie with a big smile and fun energy. Sharpest focus on the main subject with natural group selfie composition. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-dance-center", title: "Dance Center Stage", prompt: "Change the background to a nightclub or party venue with colored spotlights, laser beams, and a dance floor. Add 4-5 people dancing in the background, positioned around the main subject but not touching, with energetic poses. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to be dancing energetically with dynamic movement, arms raised or in mid-dance motion. Capture energetic nightlife photography aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-admired-entry", title: "Admired Entry", prompt: "Change the background to an elegant venue entrance with modern interior, marble flooring, and sophisticated lighting. Add 4-6 people positioned throughout the background, all turning their heads toward the main subject with impressed expressions. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stride confidently into the venue with commanding presence and elegant posture. Cinematic arrival moment aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-festival-cheer", title: "Festival Cheer", prompt: "Change the background to an outdoor music festival with stage lights visible in the distance, festival decorations, and crowd atmosphere. Add 4-5 people in the background with raised arms and enthusiastic expressions directed toward the main subject. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to have arms raised high cheering with festival energy and excitement. Dynamic festival lighting creating colorful atmosphere. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-park-admirer", title: "Park Admirer", prompt: "Change the background to a tree-lined park path with dappled sunlight, green foliage, and natural scenery. Add one person 4 meters in the background, positioned as if pausing on the path, looking toward the main subject with subtle admiring expression. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to walk gracefully along the path with natural, elegant movement. Soft afternoon sunlight through trees. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-surrounded-admirers", title: "Surrounded by Admirers", prompt: "Change the background to an upscale social venue with elegant decor and sophisticated lighting. Add 5-7 people positioned in a loose circle around the main subject, all at a respectful 2-meter distance, with attentive gazes and impressed expressions directed toward the center. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand confidently at the center with charismatic, engaging presence. Sharper focus on the main subject with softer focus on the surrounding admirers. Professional event photography aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "desired-cheek-kiss", title: "Cheek Kiss", prompt: "Add one person positioned close beside the main subject, giving a gentle cheek kiss with soft intimate gesture. Change the background to a romantic setting with warm, soft lighting like a candlelit restaurant or evening terrace. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to lean in slightly receiving the kiss with eyes closed and content expression. Intimate moment photography with shallow depth of field. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
      { key: "desired-hug-behind", title: "Hug From Behind", prompt: "Add one slightly blurred person positioned directly behind the main subject with arms wrapped around in a gentle embrace. Change the background to a romantic location like a sunset beach or cozy indoor space with warm lighting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to lean back into the embrace with relaxed shoulders and peaceful, content posture. Sharp focus on the main subject's face while the embracing person remains slightly out of focus. Intimate romantic photography aesthetic. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
    ],
  },
  famous: {
    label: "Famous",
    options: [
      { key: "famous-red-carpet", title: "Red Carpet Pose", prompt: "Change the background to a red carpet premiere event with step-and-repeat backdrop featuring sponsor logos, velvet rope barriers, and professional photographers. Add multiple camera flash effects from various angles creating dramatic cross-lighting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to strike a classic red carpet pose - one hand on hip, confident stance, and camera-ready smile. Position them center-frame with professional Hollywood premiere photography aesthetic, sharp focus on subject with slight background blur and lens flare from flashes. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-music-video", title: "Music Video Star", prompt: "Change the background to a cinematic music video set with dramatic colored spotlights, light beams cutting through haze, and professional video lighting equipment visible. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to perform dynamically as if singing or dancing in a music video with expressive, artistic movement. Multiple spotlight beams converging on the main subject. Cinematic music video aesthetic with vibrant colors and professional production quality. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-backstage-prep", title: "Backstage Prep", prompt: "Change the background to a performer's dressing room with Hollywood-style vanity mirror surrounded by bright bulbs, makeup station, wardrobe racks, and professional backstage atmosphere. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to sit elegantly at the vanity mirror as if preparing for a show, perhaps adjusting hair or makeup. Warm theatrical bulb lighting reflecting in the mirror with backstage prep aesthetic. Professional behind-the-scenes photography with authentic dressing room details. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-stage-spotlight", title: "Stage Spotlight", prompt: "Change the background to a large concert stage with bright white spotlight beam from above, stage rigging visible, and silhouetted audience in darkness below. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to perform on stage with arms raised triumphantly or holding a microphone, commanding the audience. Dark audience shapes barely visible in the background. High-contrast concert photography with theatrical stage lighting. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-tv-interview", title: "TV Interview", prompt: "Change the background to a professional television studio with talk show set design, studio cameras on tripods, boom microphones overhead, and television lighting grid visible above. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to sit professionally in an interview chair, leaning slightly forward with engaged, articulate body language. Bright television studio lighting with soft fill lights and clean professional broadcast aesthetic. Sharp HD television production quality with modern studio environment. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-autograph-session", title: "Autograph Session", prompt: "Change the background to an indoor event space with promotional backdrop behind, table in front, and 4-5 excited people lined up 2 meters away holding items to be signed. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to be seated at the signing table, pen in hand, warmly greeting fans with a friendly smile. Event lighting with photographer's flash effects. Professional celebrity meet-and-greet photography with shallow depth of field keeping focus on the main subject. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-paparazzi-walk", title: "Paparazzi Walk", prompt: "Change the background to a city street at dusk with multiple camera flash effects, motion blur on background, and 3-4 photographer silhouettes visible. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to walk confidently mid-stride with sunglasses or hand slightly raised, navigating through the paparazzi. Slightly overexposed flash lighting typical of paparazzi photography with lens flare and gritty street photography aesthetic. Sharp focus on subject with motion blur on background and photographers. Authentic celebrity candid photography style. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-award-ceremony", title: "Award Ceremony", prompt: "Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to hold a metallic award trophy proudly raised or cradled, with an emotional, grateful expression of triumph. Change the background to an elegant award ceremony venue with chandeliers, formal stage backdrop, and subtle audience silhouettes. Warm elegant lighting with photographer flash effects creating sparkle on the trophy. Professional award ceremony photography with shallow depth of field. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-social-media-star", title: "Social Media Star", prompt: "Change the background to an aesthetically curated bedroom or studio with LED strip lights, neon signs, plants, aesthetic wall art, and visible ring light setup. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to create content - perhaps holding phone for selfie, peace sign, or trendy influencer pose. Bright even lighting from ring light with soft shadows and Instagram-perfect aesthetic. Modern influencer photography with carefully styled background and professional social media content quality. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-magazine-cover", title: "Magazine Cover Shoot", prompt: "Change the background to a professional photo studio with seamless paper backdrop, visible studio lighting equipment, softboxes, and photography gear. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to strike a high-fashion editorial pose - perhaps hand on chin, intense gaze, or dynamic fashion stance. Dramatic fashion photography lighting with key light, fill light, and rim light creating professional magazine quality. Sharp focus with high-resolution editorial photography aesthetic and neutral backdrop allowing subject to stand out. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-film-set", title: "Actor on Set", prompt: "Change the background to an active film production set with director's chairs, film cameras on dollies, crew members working in the background, and professional lighting equipment. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to be in character between takes, perhaps reviewing a script or in conversation with the director. Practical film set lighting with work lights and professional production atmosphere. Authentic behind-the-scenes film production photography with visible filmmaking equipment and crew activity in soft focus. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-talk-show", title: "Talk Show Guest", prompt: "Change the background to a modern talk show set with city skyline backdrop, colorful stage design, studio audience seating visible, and professional television lighting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to sit comfortably on the guest couch, laughing naturally as if mid-conversation with the host. Bright television studio lighting with soft multi-point lighting creating professional broadcast look. Modern late-night talk show aesthetic with vibrant set colors and HD television quality. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "famous-street-recognized", title: "Recognized on Street", prompt: "Change the background to a busy urban shopping street with storefronts visible. Add 3-4 people approaching with excited expressions, phones raised for photos, positioned 2-3 meters away. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to pause graciously, waving or smiling warmly at the approaching fans. Authentic street photography aesthetic. Candid celebrity moment with slight depth of field keeping main subject in sharpest focus. Adjust the main-subject lighting so that it is coherent with the scene." },
    ],
  },
  luxury: {
    label: "Luxury",
    options: [
      { key: "luxury-yacht-pose", title: "Yacht Pose", prompt: "Change the background to a modern superyacht deck with white fiberglass hull, polished teak flooring, chrome and glass railings, and calm turquoise ocean at golden hour. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to lounge elegantly on the yacht deck, perhaps leaning on the railing gazing at the ocean or relaxing on deck furniture. Professional nautical lifestyle photography with shallow depth of field, ocean and horizon visible in background. Cinematic luxury maritime aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "luxury-private-jet", title: "Private Jet", prompt: "Change the background to a private airport tarmac with sleek white Gulfstream jet visible behind, stairs extended, and modern terminal building in the distance. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to walk confidently toward the jet or descend the stairs with sophisticated traveler poise. Bright daylight with clean aviation photography lighting. Sharp focus on subject with professional aviation photography aesthetic showing full jet in background. Luxury travel lifestyle composition. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "luxury-villa-pool", title: "Villa with Pool", prompt: "Change the background to a Mediterranean luxury villa with infinity pool overlooking the ocean, white modern architecture, glass walls, and palm trees at golden hour. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to relax poolside, perhaps seated elegantly with legs crossed or standing by the infinity edge admiring the view. Professional luxury real estate photography aesthetic with dramatic sky, ocean view, and architectural details visible. High-end lifestyle magazine quality. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "luxury-sports-car", title: "Exiting Sports Car", prompt: "Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to step elegantly out of an exotic sports car with door open, one foot on the ground in a stylish exit. Change the background to a modern glass skyscraper entrance with valet stand, marble driveway, and contemporary architecture. Professional lifestyle photography aesthetic. Sharp focus on person with luxury supercar partially visible, shallow depth of field on building. Automotive lifestyle photography style. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "luxury-hotel-suite", title: "Luxury Suite", prompt: "Change the background to a penthouse hotel suite with floor-to-ceiling windows, city lights view, modern designer furniture, marble surfaces, and elegant decor. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to relax sophisticatedly in the suite, perhaps seated on a designer sofa with champagne or standing by the window admiring the city view. Warm ambient lighting from designer lamps mixed with twilight from windows. Professional hospitality photography with sophisticated interior design visible. High-end hotel marketing aesthetic with attention to luxury details. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "luxury-rooftop-brunch", title: "Rooftop Brunch", prompt: "Change the background to an upscale rooftop terrace with glass railings, white furniture, champagne bottle in ice bucket on table, and metropolitan skyline view at late morning. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to be seated elegantly at the brunch table, perhaps holding a champagne glass or reaching for food with refined gestures. Bright natural daylight with soft umbrella shade creating flattering lighting. Professional lifestyle brunch photography with skyline bokeh in background. Sophisticated urban luxury aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "luxury-designer-boutique", title: "Designer Boutique", prompt: "Change the background to an exclusive designer boutique interior with marble floors, minimalist displays, designer clothing on racks, full-length mirrors, and soft spotlighting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to browse luxuriously, perhaps examining a designer item or checking reflection in a mirror with discerning expression. Sophisticated boutique lighting with track lights and natural light from storefront. Professional retail photography aesthetic with luxurious shopping environment. High-end fashion retail atmosphere with elegant minimalist design. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "luxury-vip-casino", title: "VIP Casino", prompt: "Change the background to an upscale VIP casino room with elegant poker table, leather chairs, crystal chandeliers, and refined decor in warm lighting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to be seated confidently at the poker table with chips nearby, exuding high-roller energy and sophisticated control. Warm ambient casino lighting with dramatic shadows and highlights. Professional gaming establishment photography with sophisticated atmosphere. Elegant Monte Carlo style casino aesthetic with refined luxury details visible. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "luxury-office-security", title: "Luxury Office w/ Security", prompt: "Change the background to a corner executive office with floor-to-ceiling windows showing city skyline, modern executive desk, leather furniture, and art on walls. Add 2 professional security personnel standing 4 meters in the background near the entrance. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand or sit powerfully behind the executive desk with commanding presence and authoritative posture. Professional corporate photography with power dynamics visible. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
      { key: "luxury-cash-gold", title: "Cash and Gold", prompt: "Add artistic arrangements of bundled currency and gold bars positioned around the person on surfaces nearby, maintaining respectful spacing. Change the background to a luxury vault room or upscale office with dramatic lighting and secure atmosphere. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to interact confidently with the wealth - perhaps running fingers over gold bars or casually seated among the riches. Dramatic side lighting creating highlights on both the person and the wealth items. Professional high-contrast photography with sharp focus on person, metallic reflections visible on gold. Sophisticated wealth aesthetic. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
    ],
  },
  power: {
    label: "Power",
    options: [
      { key: "power-ceo-tower", title: "CEO Glass Tower", prompt: "Change the background to a corner executive office on the 50th floor with floor-to-ceiling glass windows overlooking a downtown skyline at dusk, modern minimalist executive desk, Herman Miller chair, and abstract art on walls. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand powerfully by the window surveying the city below, or sit authoritatively at the desk with commanding executive presence. High-end corporate photography with power and success visual narrative. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "power-luxury-office-briefcase", title: "Power Office w/ Briefcase", prompt: "Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stride purposefully into the office carrying a luxury leather briefcase, or set it down on the desk with decisive business energy. Change the background to a modern executive office with mahogany furniture, legal documents on desk, cityscape through windows, and 2 security personnel standing 4 meters behind near the doorway. Professional corporate lighting. Sharp focus on person with depth of field showing office authority setting. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "power-futuristic-control", title: "Futuristic Control Room", prompt: "Change the background to a high-tech command center with multiple digital screens, holographic displays, LED lighting strips, sleek metal surfaces, and futuristic workstations. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to command the control room, perhaps gesturing at screens or standing with hands clasped behind back surveying data displays. Dramatic blue and white LED accent lighting with screens casting colorful light. Cinematic sci-fi corporate aesthetic with sharp focus on person, glowing screens visible in background. Professional futuristic leadership photography. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "power-bodyguards", title: "With Bodyguards", prompt: "Add 3 professional security personnel positioned 3 meters behind and to the sides of the main subject, all in dark suits with security earpieces, alert postures. Change the background to an upscale venue entrance or hotel lobby with modern architecture and elegant lighting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to walk confidently forward with VIP presence, security detail flanking protectively. Sharpest focus on the main subject with bodyguards slightly out of focus. Professional security detail photography showing power dynamics. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "power-government-podium", title: "Government Podium", prompt: "Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand authoritatively behind a government podium with multiple microphones, hands gripping the podium or gesturing while speaking. Change the background to an official press room with government seals, flags, professional lighting, and press photographers visible in soft focus. Bright professional press conference lighting with multiple camera flash effects. Professional government photography aesthetic with official atmosphere and sharp focus on the speaker. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "power-modern-queen", title: "Modern Monarch", prompt: "Change the background to a contemporary royal palace interior with minimalist throne, marble columns, high ceilings, modern art, and subtle crown or royal regalia visible nearby. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to sit regally on the throne or stand with dignified royal bearing and graceful composure. Dramatic architectural lighting with natural light from tall windows creating soft royal atmosphere. Professional royal portrait photography with contemporary elegance, maintaining traditional authority with modern aesthetics. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "power-courtroom", title: "Courtroom Authority", prompt: "Change the background to a formal courtroom with wood paneling, judge's bench, American flags, law books on shelves, and formal legal setting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to preside from the judge's bench with gavel in hand, or stand powerfully addressing the court. Professional courtroom lighting with natural light from high windows. Sharp focus with traditional legal photography aesthetic showing judicial authority and professional legal environment. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "power-mafia-boss", title: "Mafia Boss Style", prompt: "Change the background to an upscale Italian restaurant private room or classic luxury office with leather chairs, dark wood furniture, vintage decor, and dim sophisticated lighting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to sit powerfully in a leather chair with commanding presence, perhaps fingers steepled or cigar in hand with intense gaze. Dramatic film noir lighting with shadows and highlights creating cinematic atmosphere. Professional dramatic portrait photography with sophisticated organized power aesthetic, vintage luxury ambiance visible. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
      { key: "power-military-discipline", title: "Disciplined Look", prompt: "Change the background to a neutral military office or training facility with flags, commendations on walls, and professional military setting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand at attention with perfect military posture, shoulders back, chin up with disciplined bearing. Clean professional lighting with strong posture emphasis. Professional military portrait photography showing discipline and authority without political symbols or specific affiliations. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "power-panel-discussion", title: "Panel Discussion Lead", prompt: "Change the background to a conference stage with modern backdrop, table with microphones, water glasses, and panelist chairs. Add 2-3 other panelists seated beside and slightly behind the main subject. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to lean forward engaged in discussion, gesturing confidently while making a point as the clear panel leader. Sharpest focus on the main subject with conference lighting. Professional conference photography showing thought leadership and panel authority with the main subject as clear focal point. Adjust the main-subject lighting so that it is coherent with the scene." },
    ],
  },
  strengthBodyPower: {
    label: "Strength",
    options: [
      { key: "strength-female-bodybuilder", title: "Female Bodybuilder Pose", prompt: "Position the person in a classic female bodybuilder competition pose on a professional stage with spotlight from above, judges' table barely visible in darkness, and competition backdrop. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Professional fitness competition photography with high-contrast lighting emphasizing athleticism. Sharp focus on person with dark background creating stage presence. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-superheroine", title: "Superheroine Look", prompt: "Position the person in a powerful superhero stance on a dramatic urban rooftop at dusk with city skyline visible, wind effects, and heroic atmosphere. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Cinematic superhero movie aesthetic with dynamic composition and professional VFX-style lighting. No violence, only heroic presence. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-warrior-woman", title: "Warrior Woman Armor", prompt: "Position the person in a heroic warrior stance on an epic battlefield landscape at golden hour with distant mountains, dramatic sky, and ancient terrain. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Cinematic fantasy epic aesthetic with professional movie-quality rendering, sharp focus on person with environmental depth. Heroic warrior photography without violence shown. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-personal-trainer", title: "Personal Trainer Look", prompt: "Position the person in a dynamic athletic coaching pose in a modern fitness gym with mirror walls, professional equipment, motivational posters, and bright training space. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Bright gym lighting with clean professional fitness photography aesthetic. Sharp focus showing professional trainer presence with equipment visible in background. Active sports lifestyle photography emphasizing health and motivation. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-male-bodybuilder", title: "Male Bodybuilder Pose", prompt: "Position the person in a classic male bodybuilder competition pose on a professional stage with dramatic spotlight from above, dark audience area, and competition backdrop. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Professional bodybuilding photography with high-contrast stage lighting. Sharp focus on person against dark background creating competitive stage presence. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-superhero", title: "Superhero Look", prompt: "Position the person in a powerful superhero stance on a dramatic cityscape rooftop at twilight with skyscrapers visible, wind and atmospheric effects, and heroic urban setting. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Cinematic superhero film aesthetic with professional action movie lighting and dynamic composition. Heroic presence without violence. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-warrior-armor", title: "Warrior Armor", prompt: "Position the person in a commanding warrior stance on an epic fantasy battlefield at sunset with dramatic clouds, distant castles or mountains, and cinematic landscape. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Professional fantasy film aesthetic with sharp focus on person, environmental atmosphere visible. Epic cinematic warrior photography showing strength without depicting violence. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-sprint-start", title: "Sprint Start", prompt: "Position the person in a dynamic sprint start position with hands on starting line on a professional athletic track with lane markings, starting blocks, and stadium seating visible in distance. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Bright stadium lighting with slight motion blur on background suggesting imminent movement. Professional sports photography aesthetic with sharp focus on athlete, capturing pre-race tension and explosive power ready to launch. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-lifting-weights", title: "Lifting Weights", prompt: "Position the person in a powerful weightlifting pose holding heavy weights in a serious powerlifting gym with mirror walls, heavy equipment, weight plates, and professional training atmosphere. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Dramatic gym lighting from above with rim lighting highlighting muscle engagement and effort. Professional athletic photography with high-contrast lighting emphasizing strength and determination. Sharp focus on person showing power and athletic dedication. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-martial-arts", title: "Martial Arts Stance", prompt: "Position the person in a strong martial arts fighting stance in a traditional martial arts dojo with wooden floors, Japanese or Chinese decorative elements, training equipment, and serene training space. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Clean natural lighting with soft shadows creating peaceful yet powerful atmosphere. Professional martial arts photography emphasizing discipline, balance, and controlled strength. Sharp focus showing perfect form and martial arts mastery. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "strength-female-boxer", title: "Female Boxer", prompt: "Position the person in a powerful boxing fighting stance in a professional boxing ring with ropes, corner posts, ring lights overhead, and training gym atmosphere. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Dramatic overhead gym lighting creating shadows and highlights typical of boxing photography. Professional sports photography with gritty athletic aesthetic. Sharp focus on person showing strength and competitive spirit, no blood or opponent visible, solo training focus. Adjust the main-subject lighting so that it is coherent with the scene." },
    ],
  },
  spiritualityMysticism: {
    label: "Fantasy",
    options: [
      { key: "mystic-floating-meditation", title: "Floating Meditation", prompt: "Position the person floating 2 meters above ground in lotus meditation pose with crossed legs and hands resting on knees in mudra position, hovering over ancient Southeast Asian temple ruins at sunset. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Subtle ethereal glow around the body edges, slight levitation blur beneath the body, and golden light particles floating in the air around them. Maintain photorealistic rendering of the person while adding stylized fantasy background. Mystical meditation aesthetic blending realism with fantasy elements. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "mystic-stardust-body", title: "Stardust Body", prompt: "Keep the person's exact facial features and identity identical. Adapt the main subject's body pose to stand with arms slightly outstretched and head tilted back in transcendent surrender while gradually dissolving the edges of their body into glowing stardust particles from feet upward. Change the background to a cosmic night sky with stars and nebula visible. Maintain natural and proportional body size relative to the head. Maintain the person's core features recognizable in the center while outer edges transform into golden and white light particles. Soft mystical glow and particle effects. Photorealistic face and upper body transitioning to ethereal stardust lower body. Magical transformation aesthetic with cinematic VFX quality. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
      { key: "mystic-giant-eye", title: "Gaze of Light", prompt: "Change the background to a mystical landscape with dramatic sky and ancient terrain. Add a massive cosmic eye composed of light and energy in the sky above, looking down toward the person. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand with arms open wide receiving the cosmic gaze, or kneeling in reverent awe looking upward. Dramatic lighting from the eye casting ethereal glow on the person and environment. Photorealistic person with fantasy cosmic elements in sky. Cinematic fantasy aesthetic blending reality with mystical symbolism. Sharp focus on person with glowing eye dominating the sky. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "mystic-water-walking", title: "Walking on Water", prompt: "Position the person walking gracefully across an infinite calm water surface with one foot forward mid-stride, arms relaxed at sides, reflecting twilight sky with stars beginning to appear. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Glowing ripples emanating from where feet touch the water surface, bioluminescent blue-green light beneath each footstep. Maintain photorealistic person rendering with fantasy water effects. Magical twilight lighting with reflections. Mystical water-walking aesthetic with professional VFX-quality effects. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "mystic-planet-lotus", title: "Between Planets", prompt: "Position the person floating in space between two visible planets in deep lotus meditation pose with perfect posture, hands in prayer position at heart center. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Ethereal energy aura surrounding the body in blue and golden light, cosmic particles floating nearby, and distant stars visible. Maintain photorealistic rendering of the person while surrounded by space environment. Dramatic cosmic lighting with rim light from both planets. Cinematic space meditation aesthetic with professional sci-fi quality. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
      { key: "mystic-detached-shadow", title: "Detached Shadow", prompt: "Keep the person's exact facial features and identity identical. Adapt the main subject's body pose to walk contemplatively through a surreal desert or minimal landscape at sunset, perhaps looking curiously toward their escaped shadow. Maintain natural and proportional body size relative to the head. Add their shadow visibly detached and walking 3 meters away in a different direction across the ground. Maintain photorealistic person with surreal shadow behavior. Dramatic sunset lighting creating long shadows with the detached shadow clearly visible and distinct. Surrealist photography aesthetic with impossible shadow placement. Sharp focus on both person and separated shadow. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "mystic-symbol-circle", title: "Spiritual Symbol Circle", prompt: "Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand centered with eyes closed in meditation, arms slightly raised with palms facing outward channeling energy. Add a rotating circle of glowing spiritual symbols floating around them at chest height, including chakra symbols, sacred geometry patterns, and mystical glyphs. Change the background to a serene temple interior or nature setting with soft lighting. Maintain photorealistic person with fantasy symbol elements. Soft glow from symbols casting colored light on person. Mystical meditation aesthetic with cinematic quality spiritual effects. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "mystic-floating-platform", title: "Floating Platform", prompt: "Position the person standing confidently on a circular floating stone platform with powerful stance, arms crossed or hands on hips surveying the realm below, 10 meters above misty ancient ruins at dawn. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Change the background to show ancient temple ruins below shrouded in morning mist with dramatic cloudy sky. Soft levitation glow beneath the platform and mist effects. Maintain photorealistic person with fantasy floating element. Cinematic fantasy lighting with atmospheric mist and dramatic sky. Epic mystical landscape aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "mystic-dimensional-portal", title: "Dimensional Portal", prompt: "Add a large glowing circular portal behind the person showing swirling energy and alternate dimension glimpses. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to step confidently toward the portal with one hand extended touching the energy, or turn to look back dramatically before entering. Change the background to a mysterious ancient chamber or forest clearing. Dramatic lighting from the portal casting blue and purple glow on the person and surroundings. Photorealistic person with cinematic VFX portal effects. Professional sci-fi fantasy aesthetic with sharp focus on person and portal. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "mystic-light-veins", title: "Light Veins Body", prompt: "Keep the person's exact facial features and identity identical. Adapt the main subject's body pose to stand with arms gracefully extended showing the glowing energy pathways clearly, head tilted back in ethereal power while making their body semi-transparent with glowing light veins visible throughout, like luminous energy pathways under the skin. Maintain natural and proportional body size relative to the head. Change the background to a dark mystical environment. Inner golden and blue light emanating from within the body, especially concentrated along limbs and torso. Maintain facial features clearly visible with ethereal glowing body effect. Dramatic lighting from within. Mystical energy body aesthetic with professional VFX transparency and glow effects. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
    ],
  },
  freedom: {
    label: "Freedom",
    options: [
      { key: "freedom-rock-ledge", title: "Rock Ledge View", prompt: "Change the background to a narrow rock ledge jutting out from a mountain cliff with dramatic valley abyss thousands of meters below, distant mountains visible, and dramatic cloudy sky. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand triumphantly at the edge with arms spread wide embracing the view, or sit peacefully dangling legs over the abyss. Dramatic natural lighting with wind effect on clothing and hair. Professional adventure photography with extreme depth showing the vast drop below. Sharp focus on person with atmospheric perspective on distant landscape. Epic scale and solitude aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "freedom-skydiving-desert", title: "Desert Skydiving", prompt: "Position the person in a dynamic skydiving freefall pose with arms and legs spread in stable arch position, face toward camera showing exhilaration, above aerial view of vast Sahara-style desert with sand dunes 3000 meters below during bright daylight. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Motion blur on the desert terrain below suggesting rapid descent, wind effects on clothing and face, and intense sunlight from above. GoPro-style extreme sports photography with ultra-wide perspective. Sharp focus on person with blurred desert landscape emphasizing height and speed. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "freedom-stormy-sea", title: "Stormy Sea Ride", prompt: "Change the background to turbulent open ocean with large waves, dark storm clouds, rain, and dramatic seascape. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to grip a boat railing with one hand while the other reaches out into the storm, bracing against the waves with determined expression. Wind-blown rain effects, sea spray, motion suggesting boat movement on waves. Professional maritime storm photography with dramatic lighting from breaks in storm clouds. Sharp focus on person with dynamic water and weather elements. Raw power of nature aesthetic emphasizing adventure and resilience. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "freedom-ice-cave", title: "Glittering Ice Cave", prompt: "Change the background to interior of massive ice cave with translucent blue ice walls, icicles hanging from ceiling, crystalline formations, and natural light filtering through ice. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to explore the cave with wonder, perhaps touching an ice formation or looking up in amazement at the crystalline ceiling. Ethereal blue lighting from ice itself, sparkles from ice crystals, and cold atmospheric effects. Professional exploration photography with magical natural lighting. Sharp focus on person within stunning ice architecture. Frozen wonderland aesthetic with natural beauty. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "freedom-motorcycle-night", title: "Night Motorcycle Ride", prompt: "Change the background to winding mountain road at night with neon-lit city visible far below in valley, guard rails, and starry sky above. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to lean forward on the motorcycle gripping handlebars, body low in aerodynamic riding position with wind in hair. Motion blur on road and background suggesting speed, motorcycle headlight beam, and colorful city lights below. Dynamic night photography with long exposure effect. Sharp focus on person and bike with blurred road creating motion. Freedom and speed aesthetic with cinematic night ride atmosphere. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "freedom-moving-train", title: "Moving Train Wild", prompt: "Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to lean out from the train platform with arms spread wide feeling the wind, or grip the railing gazing out at the passing wilderness with pure freedom. Change the background to show exterior platform of moving vintage train traveling through remote wilderness landscape with mountains, forests, and dramatic sky visible. Motion blur on passing landscape, train details visible, and dramatic natural lighting. Adventure travel photography capturing freedom of journey. Sharp focus on person with blurred landscape emphasizing train movement through wild terrain. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "freedom-endless-desert", title: "Endless Desert", prompt: "Change the background to infinite desert landscape with rolling sand dunes extending to horizon, dramatic sky at golden hour, and complete solitude. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to walk forward leaving footprints in the sand, or stand atop a dune with arms raised in liberation and victory. Warm sunset lighting creating long shadows on dunes, slight wind effect on clothing and sand. Professional desert landscape photography with dramatic scale. Sharp focus on person as lone figure with vast empty landscape emphasizing solitude and freedom. Minimalist epic scale aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "freedom-rock-climbing", title: "Steep Rock Climb", prompt: "Position the person in a dynamic rock climbing pose gripping holds on a vertical rock face, one arm reaching high for the next hold with muscles engaged and focused determination, high on the wall with valley visible thousands of meters below, climbing route visible, and dramatic mountain landscape in distance. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Dramatic natural lighting emphasizing the height and exposure, slight chalk dust on hands. Professional climbing photography from side angle showing extreme height. Sharp focus on person with atmospheric depth showing the vast drop and mountain terrain. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "freedom-campfire-plateau", title: "Campfire Under Stars", prompt: "Change the background to rocky mountain plateau at night with blazing campfire beside the person, vast starry sky with Milky Way visible, and dark landscape stretching to horizon. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to sit relaxed by the fire gazing up at the stars with peaceful contentment, or warm hands over the flames. Warm firelight illuminating the person from one side while starlight provides ambient glow, visible stars and Milky Way above. Professional astrophotography with campfire light. Sharp focus on person with stunning night sky. Solitude and natural wonder aesthetic. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "freedom-wingsuit-canyon", title: "Wingsuit Flight", prompt: "Position the person in a dynamic wingsuit flying pose with arms and legs spread wide in full flight position, body arched for control, flying through a narrow desert canyon with red rock walls close on both sides, viewed from front, canyon floor visible far below, and blue sky visible above the canyon. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Motion blur on canyon walls suggesting extreme speed, wind effects on face and suit, and dramatic perspective. Extreme sports photography with ultra-dynamic composition. Sharp focus on person with canyon walls blurred emphasizing speed through narrow passage. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
    ],
  },
  chaos: {
    label: "Chaos",
    options: [
      { key: "chaos-flooded-street", title: "Flooded Street Run", prompt: "Position the person in a dynamic running pose through knee-deep rushing water, legs mid-stride splashing powerfully, arms pumping for speed on an urban street with abandoned cars partially submerged, debris floating, and stormy overcast sky. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Dramatic water splash effects around legs with each stride, rain falling, and emergency lighting reflections on water. Cinematic disaster movie aesthetic with dramatic action photography. Sharp focus on person with motion blur on splashing water emphasizing movement through flooded street. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "chaos-deserted-city", title: "Deserted City Walk", prompt: "Change the background to an empty urban street at dusk with flickering neon signs, broken windows, scattered papers blowing in wind, and abandoned vehicles. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to walk cautiously down the center of the deserted street, perhaps looking over shoulder with alert survivalist awareness. Eerie flickering neon lighting in pink and blue casting colored light, fog or mist at ground level, and post-apocalyptic atmosphere. Cinematic urban exploration photography with moody dramatic lighting. Sharp focus on person with deserted city environment creating isolation and mystery. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "chaos-lightning-storm", title: "Calm in Lightning", prompt: "Change the background to dramatic storm scene with multiple lightning bolts striking ground around the person, dark storm clouds, heavy rain, and electric atmosphere. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand perfectly still and composed amid the chaos, perhaps arms slightly outstretched absorbing the storm's energy with serene confidence. Bright lightning flash illumination creating dramatic side-lighting and rim light on person, rain effects, and electric energy in air. Cinematic storm photography with high-contrast dramatic lighting. Sharp focus on calm person contrasted with chaotic lightning strikes nearby creating powerful visual tension. Adjust the main-subject lighting so that it is coherent with the scene." },
      { key: "chaos-tornado-gaze", title: "Facing Tornado", prompt: "Change the background to massive tornado funnel approaching across open plains with dark rotating clouds, debris swirling in air, and dramatic stormy atmosphere. Keep the person's exact facial features and identity identical. Maintain natural and proportional body size relative to the head. Adapt the main subject's body pose to stand firm facing the tornado directly, feet planted wide with unwavering defiance, perhaps one hand raised shielding eyes to see the approaching storm. Extreme wind effects on clothing and hair, dust and debris in air, and dramatic lighting from breaks in storm clouds. Cinematic disaster movie aesthetic with epic scale showing person as tiny figure before enormous tornado. Sharp focus on person with massive twister dominating background creating dramatic scale and tension. Adjust the main-subject lighting so that it is coherent with the scene.", isPremium: true },
    ],
  },
};

export type StyleCategoryKey = keyof typeof STYLE_CATEGORIES;

// --- Premium Screen Data ---
export interface PricingPlan {
  id: string;
  duration: string;
  priceText: string;
  totalPrice: number;
  currency: string;
  savingsText?: string;
  isRecommended?: boolean;
}

export interface PremiumFeature {
  id: string;
  iconLibrary: 'MaterialCommunityIcons' | 'Ionicons' | 'Feather' | 'FontAwesome5';
  iconName: string;
  title: string;
  description: string;
}

export const PRICING_PLANS: PricingPlan[] = [
  {
    id: "free_trial",
    duration: "3 days free",
    priceText: "Then 14 CHF/month",
    totalPrice: 14.0,
    savingsText: " ",
    currency: "CHF",
  },
  {
    id: "3_months",
    duration: "3 Month",
    priceText: "CHF 15.00 /month",
    totalPrice: 45.0,
    currency: "CHF",
    savingsText: "Save 21%",
    isRecommended: true,
  },
  {
    id: "6_months",
    duration: "6 Month",
    priceText: "CHF 12.00 /month",
    totalPrice: 72.0,
    currency: "CHF",
    savingsText: "Save 36%",
  },
  {
    id: "12_months",
    duration: "12 Month",
    priceText: "CHF 10.00 /month",
    totalPrice: 120.0,
    currency: "CHF",
    savingsText: "Save 50%",
  },
];

// --- Premium Credit Limits ---
// Monthly credits that reset with subscription billing cycle
export const PREMIUM_CREDITS = 80;
export const PREMIUM_PLUS_CREDITS = 120;

// Dynamic premium features based on tier
export const getPremiumFeatures = (tier: 'premium' | 'premium_plus'): PremiumFeature[] => {
  const credits = tier === 'premium_plus' ? PREMIUM_PLUS_CREDITS : PREMIUM_CREDITS;

  return [
    {
      id: "feat_more_pics",
      iconLibrary: 'MaterialCommunityIcons',
      iconName: "image-multiple-outline",
      title: "Generate more pictures",
      description: `Create up to ${credits} images per month - because creativity should have no limits.`,
    },
    {
      id: "feat_printout_limit",
      iconLibrary: 'Ionicons',
      iconName: "infinite-outline",
      title: "Printout without limit",
      description: "Generate images with all effects and styles.",
    },
    {
      id: "feat_faster",
      iconLibrary: 'Ionicons',
      iconName: "rocket-outline",
      title: "Faster than everyone else",
      description: "Your pictures are generated faster. You go through the VIP entrance.",
    },
    {
      id: "feat_no_ads",
      iconLibrary: 'MaterialCommunityIcons',
      iconName: "advertisements-off",
      title: "No advertising",
      description: "Just you, your imagination - and your perfect self.",
    },
    {
      id: "feat_priority_support",
      iconLibrary: 'MaterialCommunityIcons',
      iconName: "crown-outline",
      title: "Support with priority",
      description: "Your requests land at the top.",
    },
  ];
};

// Legacy static export for backwards compatibility
export const PREMIUM_FEATURES: PremiumFeature[] = [
  {
    id: "feat_more_pics",
    iconLibrary: 'MaterialCommunityIcons',
    iconName: "image-multiple-outline",
    title: "Generate more pictures",
    description: `Create up to ${PREMIUM_CREDITS} images per month - because creativity should have no limits.`,
  },
  {
    id: "feat_printout_limit",
    iconLibrary: 'Ionicons',
    iconName: "infinite-outline",
    title: "Printout without limit",
    description: "Generate images with all effects and styles.",
  },
  {
    id: "feat_faster",
    iconLibrary: 'Ionicons',
    iconName: "rocket-outline",
    title: "Faster than everyone else",
    description: "Your pictures are generated faster. You go through the VIP entrance.",
  },
  {
    id: "feat_no_ads",
    iconLibrary: 'MaterialCommunityIcons',
    iconName: "advertisements-off",
    title: "No advertising",
    description: "Just you, your imagination - and your perfect self.",
  },
  {
    id: "feat_priority_support",
    iconLibrary: 'MaterialCommunityIcons',
    iconName: "crown-outline",
    title: "Support with priority",
    description: "Your requests land at the top.",
  },
];

export const PREMIUM_DISCLAIMER = "You will be billed for your subscription and you agree to our terms and conditions. It will be automatically renewed at the same price and with the same package length until you cancel it.";

// --- Generator Tips ---
export interface TipStep {
  id: string;
  image: string | null;
  title: string;
  text: string;
}

export const GENERATOR_TIPS_DATA: TipStep[] = [
  {
    id: "tip0",
    image: null,
    title: "How It Works",
    text: `1. Upload a photo: Pick an image with your face from your gallery.
2. Choose your theme: Select what you want to express – like being desired, powerful, free, famous, or more.
3. Generate your image: Tap "Generate" and let the AI create your new look.
4. Save or share: Download your image or share it with others.`,
  },
  {
    id: "tip1",
    image: "/assets/images/Tips/1.png",
    title: "High resolution",
    text: "A high-resolution output image provides more detail – for more realistic and precise results.",
  },
  {
    id: "tip2",
    image: "/assets/images/Tips/2.png",
    title: "Frontal view of the face",
    text: "A clear photo taken directly from the front improves facial recognition and ensures more accurate images. Only one face should be shown.",
  },
  {
    id: "tip3",
    image: "/assets/images/Tips/3.png",
    title: "Neutral pose",
    text: "A relaxed facial expression without strong emotions leads to more consistent and legible results.",
  },
  {
    id: "tip4",
    image: "/assets/images/Tips/4.png",
    title: "Only you in focus",
    text: "The picture should only show you and no other persons should disturb the picture.",
  },
];

// --- Age Screen ---
export const AGE_SCREEN_TITLE = "How old are you?";
export const AGE_INPUT_PLACEHOLDER = "MM.DD.YYYY";
export const AGE_CONFIRM_TEXT = "Beautiful age 😊";

// --- Age Blocked Screen ---
export const AGE_BLOCKED_TITLE = "Age Restriction";
export const AGE_BLOCKED_TEXT = "We are very sorry. Unfortunately, you are too young. For the protection of you and other users, the platform is intended for persons aged 18 and over only. Feel free to come back when you are 18 years old – we look forward to seeing you!";
export const AGE_BLOCKED_SUBSCRIPTION_NOTE = "If you have subscribed to premium services through the App Store or Google Play, you must cancel the subscription directly through the respective provider.";

// --- Support Contact ---
export const SUPPORT_EMAIL = "support@dreamai.app";

// --- Text Documents ---
interface TextDocument {
  title: string;
  content: string;
}

export const TEXT_DOCUMENTS: { [key: string]: TextDocument } = {
  legal: {
    title: "Legal",
    content: `Your security and privacy are important to us. The ${APP_NAME} app is designed to provide you with a safe and privacy-friendly experience. We do not store personal data or share any information with third parties unless required for the functionality of the app as described in our Privacy Policy.\n\nBy using this app, you confirm that you have read, understood, and accepted the Terms of Use and Privacy Policy.\n\nIf you have any questions, contact us at ${SUPPORT_EMAIL}.`,
  },
  aboutUs: {
    title: "About Us",
    content: `Welcome to ${APP_NAME}!\n\nWe are passionate about bringing dreams to life through the power of Artificial Intelligence. Our mission is to provide a fun, creative, and inspiring platform for users to generate unique images.\n\nThis app was developed with love in Switzerland.\n\nThank you for using ${APP_NAME}!`,
  },
  licenses: {
    title: "Licenses",
    content: `This app uses open-source libraries and assets. We are grateful to the developers and communities who make them available.\n\nKey Libraries:\n- Next.js\n- React\n- Tailwind CSS\n- Firebase SDK\n- Paddle.js\n- Axios\n\n(More specific license details can be added here if required).`,
  },
  agb: {
    title: "Terms of Use",
    content: `Please read these Terms of Use carefully before using the ${APP_NAME} application (the "Service") operated by Your Company Name ("us", "we", or "our").\n\nYour access to and use of the Service is conditioned on your acceptance of and compliance with these Terms. By accessing or using the Service you agree to be bound by these Terms.\n\nContent Generation:\nOur Service allows you to upload images and provide prompts to generate new images using artificial intelligence. You retain ownership of the original images you upload.\n\nProhibited Uses:\nYou agree not to use the Service:\n- In any way that violates any applicable law or regulation\n- For the purpose of exploiting or harming minors in any way\n- To generate or disseminate non-consensual explicit content\n- To generate content that promotes discrimination, hatred, or violence\n- To impersonate any person or entity\n- To infringe upon the rights of others\n\nContact Us:\nIf you have any questions about these Terms, please contact us at ${SUPPORT_EMAIL}.`,
  },
  termOfUse: {
    title: "Terms of Use",
    content: `Last updated: January 2025

Welcome to ${APP_NAME}. Please read these Terms of Use carefully before using our application.

1. Acceptance of Terms

By accessing or using the ${APP_NAME} application (the "Service"), you agree to be bound by these Terms of Use. If you do not agree to these terms, please do not use the Service.

2. Age Requirement

You must be at least 18 years old to use this Service. By using ${APP_NAME}, you confirm that you are 18 years of age or older.

3. Service Description

${APP_NAME} is an AI-powered image generation service that allows users to upload personal images and generate artistic transformations using artificial intelligence. All generated images are synthetic and created by AI algorithms.

4. User Responsibilities

You agree to:
- Only upload images for which you own the rights or have explicit permission to use
- Not upload images depicting minors under any circumstances
- Not upload images containing illegal, violent, sexual, or inappropriate content
- Not use the Service to create deceptive, misleading, or fraudulent content
- Not impersonate any person or entity without authorization
- Not use generated images to deceive, harm, or misrepresent reality
- Accept full responsibility for how you use, share, or distribute generated content

5. Prohibited Content and Uses

You may NOT use ${APP_NAME} to:
- Generate images of minors or depicting individuals under 18 years of age
- Create non-consensual intimate imagery or deepfakes
- Impersonate real individuals without their explicit consent
- Generate content that promotes hate speech, violence, discrimination, or illegal activities
- Violate any applicable laws or regulations
- Infringe upon intellectual property rights, privacy rights, or other legal rights of others
- Create content intended to deceive, defraud, or misrepresent

6. AI-Generated Content Disclaimer

All images generated by ${APP_NAME} are artificial and created by AI. They do not represent real events, real people in actual situations, or factual reality. Generated images must not be presented as authentic photographs or used to deceive others.

7. Intellectual Property

You retain ownership of the original images you upload. Generated images created by the Service are provided to you for personal use. ${APP_NAME} does not claim ownership of your uploaded images or generated content.

8. Privacy and Data Use

Your use of the Service is also governed by our Privacy Policy. We process uploaded images solely for the purpose of generating AI transformations. Please review our Privacy Policy and Data Protection Policy for details on how we handle your data.

9. Subscription and Payment Terms

${APP_NAME} offers both free and premium subscription tiers. Premium subscriptions provide additional features and credits. Subscriptions are managed through Paddle or your app store provider and will auto-renew unless cancelled. You are responsible for managing and cancelling your subscription.

10. Service Availability

We strive to provide reliable service but do not guarantee uninterrupted availability. We reserve the right to modify, suspend, or discontinue the Service at any time without liability.

11. Limitation of Liability

${APP_NAME} is provided "as is" without warranties of any kind. We are not responsible for:
- How you use or misuse generated content
- Any harm, legal consequences, or damages resulting from your use of the Service
- The accuracy, quality, or suitability of generated images for any particular purpose
- Any losses resulting from service interruptions or data loss

12. Account Termination

We reserve the right to suspend or terminate your account if you violate these Terms of Use, engage in prohibited activities, or misuse the Service.

13. Indemnification

You agree to indemnify and hold harmless ${APP_NAME}, its operators, and affiliates from any claims, damages, or legal actions arising from your use of the Service or violation of these Terms.

14. Governing Law

These Terms are governed by the laws of Switzerland. Any disputes shall be resolved in Swiss courts.

15. Changes to Terms

We reserve the right to update these Terms of Use at any time. Continued use of the Service after changes constitutes acceptance of the updated terms.

16. Contact Information

If you have any questions about these Terms of Use, please contact us at:

${SUPPORT_EMAIL}

By using ${APP_NAME}, you acknowledge that you have read, understood, and agree to be bound by these Terms of Use.`,
  },
  privacy: {
    title: "Privacy Policy",
    content: `Last updated: January 2025\n\n${APP_NAME} ("us", "we", or "our") operates the ${APP_NAME} application (the "Service").\n\nThis page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our Service.\n\nInformation Collection:\nWe collect several types of information:\n- Personal Data (email address, authentication identifiers)\n- Usage Data (device information, usage patterns)\n- Image Data (uploaded and generated images)\n\nUse of Data:\n${APP_NAME} uses the collected data to:\n- Provide and maintain the Service\n- Notify you about changes to our Service\n- Provide customer care and support\n- Monitor the usage of the Service\n- Detect, prevent and address technical issues\n- Process payments for subscriptions\n\nSecurity:\nThe security of your data is important to us, but no method of transmission over the Internet is 100% secure.\n\nChildren's Privacy:\nOur Service does not address anyone under the age of 18.\n\nContact Us:\nIf you have any questions about this Privacy Policy, please contact us at ${SUPPORT_EMAIL}.`,
  },
  dataProtection: {
    title: "Data Protection",
    content: `Last updated: January 2025

1. Data Controller

The data controller responsible for data processing in accordance with the General Data Protection Regulation (GDPR) is:

${APP_NAME}
[Address - To be provided]
${SUPPORT_EMAIL}
[Phone number - To be provided]

2. Data Processing in the App
2.1 What Data We Process

The ${APP_NAME} app processes the following data:
- User account information (email address, authentication identifiers)
- Uploaded images for AI transformation
- Generated AI images
- Payment and subscription information (processed via Paddle and app store providers)
- Usage data (credits, generation history, premium status)

2.2 Purpose of Data Processing

The processing of user data serves the following purposes:
- Providing AI-powered image generation and transformation services
- Managing user accounts and authentication
- Processing payments and subscriptions
- Delivering premium features to subscribers
- Improving and maintaining the Service

2.3 Data Sharing and Third Parties

Your data is processed by the following third-party services:
- Firebase (Google): Authentication and database services
- Fal AI: AI image generation processing
- Paddle: Payment processing and subscription management
- App Store Providers (Apple/Google): In-app purchases and subscriptions

We do not sell your personal data or use it for advertising purposes.
Your uploaded and generated images are processed solely for the purpose of providing the Service.

3. Legal Basis for Processing

The processing of user data is based on:
- Article 6(1)(b) GDPR (performance of a contract) - providing the Service
- Article 6(1)(a) GDPR (consent) - processing uploaded images for AI generation
- Article 6(1)(f) GDPR (legitimate interests) - improving the Service

4. Storage and Deletion of Data
4.1 Retention Period

User account data is retained for as long as your account remains active.
Uploaded images are processed and then deleted after generation.
Generated images are stored temporarily for your download and then removed.
Payment records are retained as required by law (typically 7-10 years).

4.2 Account Deletion

You may request deletion of your account and all associated data at any time through the app settings or by contacting ${SUPPORT_EMAIL}.

Upon account deletion:
- Your personal data will be permanently deleted within 30 days
- Payment records will be retained only as required by law
- Generated images will be permanently deleted

5. User Rights (Data Subject Rights)

As a user, you have the following rights under the GDPR:

Right of Access (Art. 15 GDPR) – You can request confirmation of what data about you is being processed.

Right to Rectification (Art. 16 GDPR) – You can request correction of inaccurate data.

Right to Erasure (Art. 17 GDPR) – You can request deletion of your personal data.

Right to Restriction of Processing (Art. 18 GDPR) – You may request restriction of processing in certain circumstances.

Right to Data Portability (Art. 20 GDPR) – You can request a copy of your data in a structured, machine-readable format.

Right to Object (Art. 21 GDPR) – You can object to processing based on legitimate interests.

Right to Withdraw Consent (Art. 7(3) GDPR) – You can withdraw consent for image processing at any time.

6. Data Security

To protect user data, ${APP_NAME} employs the following security measures:

- Encryption of data in transit (HTTPS/TLS)
- Firebase Authentication for secure user authentication
- Secure API endpoints with authentication
- Watermarking of generated images to prevent misuse
- Regular security updates and monitoring
- Restricted access to user data

7. Use by Minors

The app is intended only for users aged 18 and over. By using ${APP_NAME}, you confirm that you are at least 18 years old.

Users under 18 are not permitted to use this Service. If we discover that a minor has provided personal data, we will delete it immediately.

8. Consent for Image Processing

Before generating AI images, you must provide explicit consent confirming that:
- You own the rights to the uploaded image or have permission to use it
- The image does not depict minors
- The image does not contain illegal, violent, or inappropriate content
- You understand that generated images are artificial and must not be used to deceive or misrepresent

9. International Data Transfers

Your data may be transferred to and processed in countries outside the European Economic Area (EEA) where our service providers (Firebase, Fal AI, Paddle) operate.

These transfers are protected by:
- Standard Contractual Clauses (SCCs) approved by the European Commission
- Adequacy decisions where applicable
- Other appropriate safeguards as required by GDPR

10. Changes to This Data Protection Policy

We reserve the right to update this data protection policy to reflect legal or operational changes. The current version is always available within the app.

Significant changes will be communicated to users via email or in-app notification.

11. Contact and Complaints

If you have any questions about this data protection policy or wish to exercise your rights, please contact:

${APP_NAME}
${SUPPORT_EMAIL}

You also have the right to lodge a complaint with your local data protection supervisory authority if you believe your data protection rights have been violated.`,
  },
  cookiePolicy: {
    title: "Cookie Policy",
    content: `This Cookie Policy explains how Your Company Name uses cookies and similar technologies when you use our ${APP_NAME} application.\n\nWhat are cookies?\nCookies are small data files placed on your device.\n\nWhy do we use cookies?\nWe use cookies for:\n- Essential app functionality\n- Performance and functionality enhancements\n- Analytics and customization\n\nContact Us:\nIf you have any questions about our use of cookies, please email us at ${SUPPORT_EMAIL}.`,
  },
};

// --- Account Deletion ---
export const DELETION_REASONS: { id: string; text: string; nextView: DeletionFlowView }[] = [
  { id: "no_longer_use", text: "I no longer use the app", nextView: "noLongerUse" },
  { id: "not_satisfied_images", text: "I'm not satisfied with the generated images", nextView: "feedbackWithPhotos" },
  { id: "too_many_paid_features", text: "Too many features require payment", nextView: "premiumUpsell" },
  { id: "created_images_wanted", text: "I've created the images I wanted", nextView: "finalConfirmation" },
  { id: "problems_paying", text: "Problems with paying", nextView: "paymentHelp" },
  { id: "switching_app", text: "I'm switching to a different app", nextView: "feedbackSwitching" },
  { id: "data_protection_concerns", text: "Data protection concerns", nextView: "dataProtection" },
  { id: "technical_issues", text: "I experienced technical issues", nextView: "technicalHelp" },
  { id: "miscellaneous", text: "Miscellaneous", nextView: "feedback" },
];

// --- Local Storage Keys ---
export const STORAGE_KEYS = {
  TERMS_ACCEPTED: "dreamai_terms_accepted",
  AGE_VERIFIED: "dreamai_age_verified",
};
