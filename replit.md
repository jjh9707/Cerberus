# FilterOn - 청소년 사이버 보안 교육 웹사이트

## Overview

FilterOn is an interactive educational web application designed to teach children and teenagers (elementary to middle school students) about cybersecurity through gamification. The platform uses a virtual money system where users start with 100,000 won and lose money when they fail to identify dangerous messages (phishing, SMS scams, SNS impersonation, and game item scams). The application emphasizes learning through consequences in a safe, virtual environment that mimics real-world financial losses from cyber scams.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework**: React with TypeScript using Vite as the build tool and development server.

**Routing**: Client-side routing implemented with Wouter, a lightweight React router. The application uses a single-page architecture with routes for home, learning modules, quizzes, deepvoice information, and parent resources.

**State Management**: 
- React Context API (GameContext) for global game state management
- Local storage persistence for game progress, user money, answered questions, and module completion
- TanStack React Query for server state management (configured but minimal server interaction currently)

**UI Framework**: shadcn/ui component library built on Radix UI primitives with Tailwind CSS for styling. The design system follows a child-friendly aesthetic with rounded corners, bright colors (primary blue, secondary green, accent orange), and large touch-friendly components.

**Design System**:
- Typography: Nunito (primary, friendly rounded sans-serif) and Poppins (secondary, clean UI elements)
- Color scheme: Light mode optimized with custom HSL color variables for primary, secondary, accent, destructive states
- Spacing: Consistent 4px-based scale (4, 6, 8, 12, 16) for rhythm
- Responsive grid: Mobile-first with breakpoints at md (tablet, 2-column) and lg (desktop, 3-column)

**Game Mechanics**:
- Virtual money system starting at 100,000 won
- Risk-based deduction system: low (5,000), medium (15,000), high (30,000), very high (50,000)
- Three learning modules: Smishing, SNS Impersonation, Game Item Scams
- 30-second timer per question
- Bankruptcy screen when money reaches zero
- Progress tracking per module with completion status

### Backend Architecture

**Server Framework**: Express.js with TypeScript, serving both API routes and static frontend assets.

**Development Setup**: 
- Vite middleware integration in development mode for HMR (Hot Module Replacement)
- Separate build process for production (esbuild for server, Vite for client)
- Static file serving from dist/public in production

**Session Management**: Configured for connect-pg-simple session store (for PostgreSQL sessions), though currently using in-memory storage.

**Storage Interface**: 
- Abstract IStorage interface defining CRUD operations
- MemStorage implementation for in-memory user data (current default)
- Designed to be swappable with database-backed storage

**API Structure**: Routes registered through registerRoutes function, prefixed with /api. Currently minimal backend logic as game state is primarily client-side.

### Data Storage

**Database ORM**: Drizzle ORM configured for PostgreSQL with Neon serverless driver.

**Schema**: 
- Users table with id (UUID), username (unique), and password fields
- Zod schema validation integrated via drizzle-zod
- Migration support through drizzle-kit

**Client-Side Persistence**: 
- Game state (money, progress, answered questions) stored in browser localStorage
- Structured GameState interface with module progress tracking
- Questions and module definitions stored as static constants in code

**Data Models**:
- Question: message content, sender, danger status, risk level, explanation, category
- ModuleProgress: completion status, correct answers, total questions, last played timestamp
- GameState: current money, answered questions array, current module, tutorial completion, module progress map

### Authentication & Authorization

**Planned Implementation**: Passport.js with local strategy configured as dependency, but not yet implemented in routes. Current application runs without user authentication.

## External Dependencies

### UI & Styling
- **Radix UI**: Comprehensive set of unstyled, accessible component primitives (@radix-ui/react-*)
- **Tailwind CSS**: Utility-first CSS framework with custom configuration
- **shadcn/ui**: Pre-built component patterns following Radix + Tailwind conventions
- **class-variance-authority**: Type-safe variant management for components
- **Lucide React**: Icon library

### Database & ORM
- **Neon Serverless**: PostgreSQL serverless driver (@neondatabase/serverless)
- **Drizzle ORM**: TypeScript ORM with schema definitions and migrations
- **connect-pg-simple**: PostgreSQL session store for Express

### Forms & Validation
- **React Hook Form**: Form state management with @hookform/resolvers
- **Zod**: Schema validation library
- **zod-validation-error**: User-friendly validation error messages

### Development Tools
- **Vite**: Build tool and development server
- **esbuild**: Fast JavaScript bundler for production server build
- **TypeScript**: Type safety across frontend and backend
- **Replit plugins**: Runtime error modal, cartographer, dev banner for Replit environment

### Utilities
- **date-fns**: Date manipulation and formatting
- **clsx & tailwind-merge**: Conditional CSS class management
- **nanoid**: Unique ID generation
- **Wouter**: Lightweight React router (alternative to React Router)

### Game-Specific
- **Web Audio API**: Browser-native audio context for sound effects (money loss, success sounds)
- **cmdk**: Command menu interface component
- **embla-carousel-react**: Touch-friendly carousel component

### DeepVoice (Voice Cloning) Feature
- **ElevenLabs API**: Voice cloning and text-to-speech for educational deepfake demonstration
- **POST /api/convert-voice**: Backend endpoint for voice conversion
  - Accepts audio file (webm) and text via FormData
  - Creates temporary voice clone, generates TTS, deletes clone immediately
  - Returns converted audio as audio/mpeg
- **Environment Variable**: `ELEVENLABS_API_KEY` required for API access
- **Privacy Protection**: Voice clones are deleted from ElevenLabs immediately after use, temp files deleted from server

### Feedback System
- **POST /api/feedback**: Submits user feedback to Google Sheets
- **Environment Variable**: `GOOGLE_SHEETS_SCRIPT_URL` for Google Apps Script web app

### Potential Future Integrations
The package.json includes several dependencies that suggest planned features:
- **Stripe**: Payment processing (not currently implemented)
- **Nodemailer**: Email functionality
- **OpenAI/Google Generative AI**: AI integration possibilities
- **JWT**: Token-based authentication
- **Express Rate Limit**: API rate limiting
- **Multer**: File upload handling (used for voice conversion)