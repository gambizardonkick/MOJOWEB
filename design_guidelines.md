# MojoTX Gambling Streamer Website - Design Guidelines

## Design Approach

**Selected Approach:** Reference-Based (Gambling/Streaming Platform Aesthetic)

**Primary References:**
- Kick.com streaming platform aesthetics
- Modern gambling platforms (Stake, Gamdom) for card layouts and data presentation
- Gaming UI patterns for competitive elements and rank displays

**Design Principles:**
1. **High Energy & Competition:** Create visual excitement through bold typography, glowing effects, and dynamic card layouts
2. **Data Clarity:** Leaderboards and stats must be instantly scannable with clear hierarchy
3. **Dark Premium Feel:** Deep backgrounds with luminous accents create immersive gambling/streaming environment
4. **Gamification Visual Language:** Rank badges, progress indicators, and reward displays should feel tactile and valuable

## Typography

**Font System:**
- **Primary:** Inter or Poppins (600-800 weights) for headlines and competitive data
- **Secondary:** System font stack for body text and descriptions
- **Mono:** JetBrains Mono for codes and technical displays

**Type Scale:**
- Hero/Page Titles: text-5xl to text-6xl, font-bold
- Section Headers: text-3xl to text-4xl, font-semibold
- Card Titles: text-xl to text-2xl, font-semibold
- Leaderboard Ranks: text-4xl to text-5xl, font-extrabold (oversized for impact)
- Prize Amounts: text-2xl to text-3xl, font-bold with tabular numbers
- Body Text: text-base to text-lg
- Small Labels: text-sm, uppercase tracking-wider

## Layout System

**Spacing Primitives:** Use Tailwind units of 4, 6, 8, 12, 16, 24 (e.g., p-4, gap-6, mt-8, py-12, mb-16, space-y-24)

**Grid Strategy:**
- Max container width: max-w-7xl
- Leaderboard: Single column stack with full-width cards
- Level Milestones: Grid of 3-4 columns (grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4)
- Challenges: Grid of 2-3 cards per row (grid-cols-1 md:grid-cols-2 lg:grid-cols-3)
- Consistent section padding: py-16 to py-24 for desktop, py-12 for mobile

**Page Structure:**
Each page follows: Hero/Title Bar → Primary Content Grid → Secondary Information → CTA Footer

## Component Library

### Navigation
- Sticky top navigation with blur backdrop effect
- Logo left, main nav center, Discord/Social icons right
- Mobile: Hamburger menu with full-screen overlay
- Active page indicator with underline or glow effect

### Leaderboard Components
- **Countdown Timer:** Large, prominent display with individual digit cards and labels (Days/Hours/Minutes/Seconds)
- **Prize Pool Card:** Oversized total with gradient background, positioned above leaderboard
- **Rank Cards:** Full-width cards with:
  - Left: Large rank number with medal icons for top 3 (1st, 2nd, 3rd get special treatment)
  - Center: Username/player name (text-xl font-bold)
  - Right side: Wagered amount and prize in stacked layout
  - Hover: Subtle lift and glow effect
- Top 3 entries get enhanced styling with borders/glows

### Level Milestone Cards
- **Badge Display:** Centered rank badge image (large, 120px+)
- **Rank Name:** Below badge (text-2xl font-bold)
- **Rewards List:** Bullet points or icon list of bonuses
- **Claim Button:** Full-width primary button at card bottom
- **Modal Popup:** Discord ticket creation overlay with close button, instructions, and Discord link button
- Cards arranged in progressive grid showing rank hierarchy

### Challenge Cards
- **Game Image:** Top of card, aspect-16/9 or square, with subtle overlay
- **Challenge Details:** 
  - Game name (text-xl font-semibold)
  - Multiplier requirement with "x" prefix (large, bold)
  - Min bet amount with currency icon
  - Prize display (prominent, text-2xl)
- **Status Badge:** Active/Expired indicator in corner
- **Border Glow:** Subtle animated glow for active challenges

### Free Spins Claim Section
- **Code Display:** Large copy-able code box with one-click copy button
- **Game Info Card:**
  - Game logo/image
  - Provider name (Hacksaw Gaming)
  - Spin details (100 x $0.20)
  - Claims remaining with progress bar
  - Expiration countdown timer
- **Requirements Box:** Bordered section with checkmark list
- **Claim CTA:** Large primary button (disabled when requirements not met or expired)

### Referral Program Display
- **Hero Stats:** Large earnings potential numbers (up to $2,500)
- **How It Works:** Numbered step cards (1-2-3) with icons
- **Payout Tiers Table:**
  - Wager ranges in rows
  - Corresponding payouts
  - Highlight maximum tier
- **Referral Code Box:** Copy-able code with share buttons
- **Discord CTA:** Button linking to reward claim channel

### Admin Panel Components
- **Data Tables:** Clean, editable tables for leaderboard entries
- **Form Inputs:** Text fields, number inputs, image uploaders for challenges
- **Live Preview:** Show how changes appear on public site
- **Toggle Switches:** Enable/disable challenges, free spins offers
- **Save Buttons:** Prominent save actions with success confirmations

### Shared UI Elements
- **Buttons:**
  - Primary: Large, bold with glow effect on hover
  - Secondary: Outlined variant
  - Copy buttons: Icon + text with success state animation
  - Disabled state: Reduced opacity with cursor-not-allowed
- **Cards:** Consistent border-radius (rounded-xl to rounded-2xl), backdrop blur for glassmorphic effect
- **Badges:** Pill-shaped status indicators (Active/Expired/Claimed)
- **Progress Bars:** Track claims remaining, countdown timers
- **Modals:** Centered overlay with dark backdrop, max-w-md to max-w-lg, close button top-right

## Images

**Hero Image:** No traditional hero image - instead use ambient background graphics/patterns that create depth without dominating

**Required Images:**
1. **Rank Badges:** 24 badge images (Bronze 1-3, Silver 1-3, Gold 1-3, Emerald 1-3, Sapphire 1-3, Ruby 1-3, Diamond 1-3, Opal 1-3) - prominently displayed on Level Milestones page, sized at 120-160px
2. **Game Images:** Challenge card thumbnails showing game screenshots/logos - aspect-ratio-16/9, rounded corners
3. **Free Spins Game Logo:** Featured game branding for Rotten by Hacksaw Gaming
4. **Background Elements:** Subtle geometric patterns, gradient meshes, or abstract gaming motifs that add depth without distraction

**Image Treatment:**
- Rank badges: Sharp, glowing treatment with subtle drop shadows
- Game images: Slight blur overlay for text legibility when needed
- Background: Low opacity patterns that don't compete with content

## Animations

**Minimal, Purpose-Driven:**
- Countdown timer: Flip animation on number changes
- Rank cards: Subtle hover lift (translateY(-4px))
- Buttons: Glow intensity change on hover
- Modal: Fade in with scale-up entrance
- Copy buttons: Brief checkmark success animation
- **NO** scroll-triggered animations or excessive parallax