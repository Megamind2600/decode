# Overview

This is a full-stack AI-powered interview preparation application built with React and Express. The application helps users practice interview questions, receive AI-generated feedback, and track their progress through a gamified experience with referral systems and A/B testing capabilities.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite for development and build tooling
- **UI Components**: Shadcn/ui component library with Radix UI primitives for accessibility
- **Styling**: Tailwind CSS with custom CSS variables for theming
- **State Management**: React Query for server state, React Context for authentication
- **Routing**: Wouter for client-side routing
- **Form Handling**: React Hook Form with Zod validation

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ES modules
- **API Design**: RESTful endpoints with JSON responses
- **Validation**: Zod schemas shared between client and server
- **Error Handling**: Centralized error middleware with structured responses

## Database Layer
- **ORM**: Drizzle ORM for type-safe database queries
- **Database**: PostgreSQL with Neon serverless database
- **Schema Management**: Drizzle migrations with shared schema definitions
- **Connection**: Connection pooling with postgres-js driver

## Authentication & Session Management
- **Strategy**: Simple email/password authentication with client-side storage
- **Session Storage**: localStorage for user state persistence
- **Security**: Password-based authentication with user-generated codes

## AI Integration
- **Provider**: Google Gemini AI for question evaluation
- **Functionality**: Structured JSON responses for interview feedback with scoring
- **Evaluation Criteria**: Structure, content, and communication scoring (1-10 scale)

## A/B Testing Framework
- **Implementation**: User-based A/B groups (A/B) assigned at registration
- **Configuration**: Database-driven marketing config and app settings
- **Scope**: Hero messaging, referral content, and feature toggles

## Referral System
- **Code Generation**: 6-character alphanumeric referral codes
- **Rewards**: Additional questions earned through successful referrals
- **Tracking**: Complete referral analytics and statistics

## File Structure
- `/client` - React frontend application
- `/server` - Express backend API
- `/shared` - Shared TypeScript schemas and types
- `/components.json` - Shadcn/ui configuration

## Development Workflow
- **Development**: Hot reload with Vite dev server
- **Build**: Vite for frontend, esbuild for backend bundling
- **Type Safety**: Strict TypeScript configuration across all packages
- **Database**: Push-based schema updates with Drizzle

# External Dependencies

## Core Infrastructure
- **Database**: Neon PostgreSQL serverless database
- **AI Service**: Google Gemini AI API for interview evaluation
- **Frontend Hosting**: Static file serving through Express in production

## Key Libraries
- **UI Framework**: React 18 with TypeScript
- **Component Library**: Radix UI primitives with Shadcn/ui
- **Styling**: Tailwind CSS with PostCSS
- **Database**: Drizzle ORM with postgres-js driver
- **Validation**: Zod for runtime type checking
- **Forms**: React Hook Form with resolver integration
- **State Management**: TanStack Query for server state
- **Build Tools**: Vite for frontend, esbuild for backend

## Development Tools
- **Runtime**: tsx for TypeScript execution
- **Type Checking**: TypeScript compiler
- **Linting**: Built-in TypeScript strict mode
- **Development**: Replit-specific plugins for enhanced development experience