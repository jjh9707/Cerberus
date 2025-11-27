# FilterOn - Design Guidelines

## Design Approach

**Reference-Based Approach**: Drawing inspiration from educational gamification platforms (Duolingo, Khan Academy Kids) and child-friendly financial literacy apps. The design emphasizes playful engagement, clear visual hierarchy, and intuitive navigation suitable for elementary to middle school students.

**Core Design Principles**:
- Playful but purposeful: Game-like aesthetics that support learning goals
- Clarity over complexity: Large, touch-friendly elements with obvious affordances
- Progressive disclosure: Information revealed step-by-step to avoid overwhelming young users
- Immediate feedback: Visual responses to every action

## Typography

**Font Families**:
- Primary: Nunito (rounded, friendly sans-serif via Google Fonts)
- Secondary: Poppins (clean, modern for UI elements)

**Hierarchy**:
- Hero/Main headings: 3xl-4xl (48-56px), extra-bold weight
- Section headings: 2xl-3xl (32-40px), bold weight
- Money display: 5xl-6xl (48-60px), black weight - ALWAYS prominent
- Body text: lg-xl (18-20px), medium weight for readability
- Button text: lg (18px), semibold weight
- Quiz questions: xl (20px), semibold weight
- Explanations: base-lg (16-18px), regular weight

## Layout System

**Spacing Primitives**: Use Tailwind units of **4, 6, 8, 12, 16** for consistent rhythm
- Component padding: p-6 to p-8
- Section spacing: py-12 to py-16
- Element gaps: gap-4 to gap-6
- Button padding: px-8 py-4

**Grid System**:
- Mobile (base): Single column, full-width cards
- Tablet (md): 2-column for module cards
- Desktop (lg): 3-column for learning modules, 2-column for quizzes

**Container Constraints**:
- Max width: max-w-6xl for content sections
- Quiz containers: max-w-3xl centered
- Module cards: min-height ensures consistent card sizes

## Component Library

### Navigation
- **Top Bar**: Fixed position with money display right-aligned, logo left, menu icon for mobile
- **Money Display**: 
  - Container: Rounded pill with subtle shadow, prominent top-right position
  - Icon: Coin emoji (💰) or money icon at 2xl size
  - Amount: Bold, extra-large text with animated number transitions
  - Deduction animation: Red sliding text (-XX,XXX원) that fades out

### Cards & Containers
- **Module Cards**: 
  - Rounded corners (rounded-2xl)
  - Generous padding (p-8)
  - Subtle elevation with shadows
  - Large icon at top (64x64px minimum)
  - Title, brief description, "시작하기" button
  
- **Quiz Container**:
  - Full-width on mobile, centered max-w-3xl on desktop
  - Risk indicator badge at top (⚠️ with risk level text)
  - Message display area with chat-bubble styling
  - Timer bar (visual progress indicator, 30-second countdown)
  
- **Result Cards**:
  - Centered, max-w-2xl
  - Giant final amount display
  - Emoji indicator based on performance (🏆, 👍, 😅, 😱)
  - Feedback message and restart button

### Buttons
- **Primary Actions**: 
  - Large size: px-10 py-5, rounded-full
  - Text: lg-xl, semibold
  - Full-width on mobile, auto-width on desktop
  
- **Quiz Choices**:
  - Two large buttons: "안전해요" (safe) and "위험해요" (danger)
  - Icon + text layout
  - Equal width, stacked on mobile, side-by-side on tablet+
  - Generous touch targets (minimum 60px height)

- **Module Selection**:
  - Card-style buttons with icon, title, and arrow
  - Hover state with slight lift effect

### Forms & Inputs
- Not applicable for this project (quiz-based interaction only)

### Feedback Elements
- **Correct Answer**: 
  - Green checkmark animation (scale + fade in)
  - Celebratory text with confetti-like decoration
  
- **Wrong Answer**:
  - Red X animation
  - Money deduction display (large, animated, red text sliding from right)
  - Explanation box appears below with icon and clear text

- **Explanation Boxes**:
  - Rounded container (rounded-xl)
  - Icon on left, text on right
  - Padding: p-6
  - Border accent on left edge

### Data Display
- **Progress Indicators**:
  - Timer: Horizontal bar that depletes (visual width animation)
  - Module completion: Not used (money-only system)
  
- **Tutorial Overlay**:
  - Semi-transparent backdrop
  - Centered white card with arrow pointers
  - Skip button in corner

## Animations

**Use Sparingly - Only for Critical Feedback**:
- Money deduction: Number change with red text slide-in animation (300ms)
- Correct/Wrong indicators: Scale + fade (200ms)
- Card hover: Subtle lift (transform translateY -2px, 150ms)
- Button press: Scale down to 0.98 (100ms)

**No Animations**: Background decorations, page transitions, excessive micro-interactions

## Images

**Hero Section** (Homepage):
- Full-width illustration showing diverse children using devices safely
- Illustrative style (not photographic): Friendly, colorful character-based art
- Placement: Top of homepage, height: 50vh on mobile, 60vh on desktop
- Content overlay: Centered title "필터온과 함께 사이버 보안 배우기!" with translucent background

**Module Icons**: 
- Large illustrative icons for each module (smishing, SNS, game scams)
- 128x128px minimum, placed at top of module cards
- Style: Flat illustration with rounded shapes

**Quiz Visuals**:
- Phone mockup frames showing example messages
- Use placeholder images or simple CSS-drawn phone frames
- Keep messages text-based for clarity

**Deepvoice Page**:
- Illustration of sound waves or voice visualization
- Placement: Top of section, alongside explanatory text
- Educational diagram style

**No Photography**: Keep all imagery illustrative and child-appropriate

## Page Structures

### Homepage
- Hero with illustration and welcome message
- Money display prominent in header
- 3-column module card grid (responsive)
- Footer with parent information link

### Quiz Pages
- Fixed header with money display and timer
- Centered quiz container (max-w-3xl)
- Large message display area
- Two-button choice layout
- Explanation section (appears after answer)
- Next question button

### Deepvoice Page
- Illustration header (40vh)
- Section: "딥보이스란?" with clear explanation
- Section: Privacy promise box (highlighted with border/shadow)
- Coming soon notice for recording feature
- Back to home button

### Results Page
- Centered vertical layout
- Giant final amount (6xl text)
- Performance emoji and message
- Detailed breakdown (optional expandable section)
- Large "다시 시작하기" button

---

**Accessibility**: All interactive elements minimum 44x44px touch targets, high contrast text, clear focus states for keyboard navigation, simple language throughout.