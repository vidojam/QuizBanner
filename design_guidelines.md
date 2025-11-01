# Design Guidelines: Learning Reinforcement Banner Application

## Design Approach
**System-Based Approach**: Material Design principles adapted for a productivity/learning tool
**Rationale**: This is a utility-focused application where efficiency, clarity, and learnability are paramount. The screensaver functionality requires bold typography and high contrast for quick comprehension.

## Core Design Elements

### A. Typography
- **Primary Font**: Inter or Roboto via Google Fonts CDN
- **Question Text (Screensaver)**: 4xl-6xl weight-bold, center-aligned
- **Answer Text (Screensaver)**: 3xl-5xl weight-semibold, center-aligned
- **Form Labels**: text-sm font-medium uppercase tracking-wide
- **Input Fields**: text-base font-normal
- **Buttons**: text-sm font-semibold uppercase tracking-wider

### B. Layout System
**Spacing Primitives**: Tailwind units of 2, 4, 6, and 8 for consistent rhythm
- Component padding: p-4 to p-8
- Section spacing: space-y-6
- Form element gaps: gap-4
- Container margins: m-4 to m-8

**Layout Structure**:
- **Main Container**: max-w-4xl mx-auto p-8 (input mode)
- **Screensaver**: w-full h-screen (fullscreen takeover)
- **Form Grid**: Single column layout with clear visual separation between Q&A pairs

### C. Component Library

**Input Mode Components**:
1. **Header Section**
   - App title (text-3xl font-bold mb-8)
   - Instant screensaver trigger button (prominent, top-right)
   
2. **Question-Answer Form**
   - Card-based layout for each Q&A pair
   - Sequential numbering (1-10)
   - Paired inputs: Question textarea (rows-3) + Answer textarea (rows-2)
   - Individual delete button per card (text-sm, right-aligned)
   - Visual hierarchy: Question input larger than answer input
   
3. **Control Panel**
   - Add new Q&A button (primary, w-full if under 10 pairs)
   - Counter display: "X/10 questions added"
   - Start screensaver button (secondary, prominent when pairs exist)

**Screensaver Mode Components**:
1. **Banner Display**
   - Full-width container (w-full)
   - Minimum height: h-1/2 (50vh) to h-3/4 (75vh)
   - Centered content: flex items-center justify-center
   - Text centered with generous padding (p-12 to p-16)
   
2. **State Transitions**
   - Question state: Display question text only
   - Answer reveal: Fade-in answer below question after 15s
   - Smooth transitions between Q&A pairs
   
3. **Exit Controls**
   - Subtle exit button (top-right corner, small)
   - ESC key handler (no visual needed)

**Buttons**:
- Primary Action: px-6 py-3 rounded-lg font-semibold shadow-md
- Secondary Action: px-6 py-3 rounded-lg font-semibold border-2
- Delete Action: px-3 py-1.5 rounded text-sm
- Icon Library: Heroicons via CDN for delete (TrashIcon), add (PlusIcon), play (PlayIcon)

### D. Interaction Patterns

**Form Interactions**:
- Auto-expand textareas as user types
- Disable "Add" button when 10 pairs reached
- Confirm dialog for delete actions
- Visual feedback on successful save (subtle)

**Screensaver Behavior**:
- Random banner positioning variation (avoid always center-screen)
- 15-second timer display (subtle progress indicator)
- Smooth fade transitions (300ms) between question/answer states
- Cycle through all Q&A pairs randomly, no repeats until all shown

**Responsive Considerations**:
- Desktop (primary): Full feature set as described
- Mobile/Tablet: Scale banner text appropriately, maintain readability
- Banner minimum height: Always maintain 50vh minimum

### E. Accessibility
- Form inputs: Clear labels, proper aria-labels
- Keyboard navigation: Tab order through all interactive elements
- Focus states: Visible focus rings on all interactive elements
- Screensaver exit: Both click and ESC key support
- Text contrast: Ensure readability against random banner backgrounds (use text shadows or overlays as needed)

## Special Considerations

**Color Randomization** (Functional Requirement):
- Generate vibrant, saturated colors for banner backgrounds
- Ensure sufficient text contrast automatically
- No color selection needed in design - handled programmatically

**Data Persistence**:
- LocalStorage for Q&A pairs
- Graceful handling of empty states
- Clear visual indicator when no questions exist

**Empty States**:
- Welcoming message prompting first question entry
- Example Q&A placeholder text in first form
- Disabled screensaver buttons when no questions exist

This design prioritizes clarity, usability, and efficient learning through bold typography and ample whitespace, creating an effective study tool that's both functional and visually engaging during screensaver mode.