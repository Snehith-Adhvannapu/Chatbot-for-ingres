# Overview

INGRES (India Ground Water Resource Estimation System) is a full-stack web application that provides an AI-powered chat interface for querying groundwater assessment data across India. The system allows users to interact with groundwater statistics, historical data, and regional assessments through natural language queries in both English and Hindi. It features a modern React frontend with shadcn/ui components and an Express.js backend with PostgreSQL database integration.

# User Preferences

Preferred communication style: Simple, everyday language.

# System Architecture

## Frontend Architecture
- **Framework**: React with TypeScript using Vite as the build tool
- **UI Library**: shadcn/ui components built on Radix UI primitives with Tailwind CSS styling
- **Routing**: Wouter for lightweight client-side routing
- **State Management**: TanStack Query for server state management and caching
- **Styling**: Tailwind CSS with CSS variables for theming support
- **Build System**: Vite with custom path aliases (@/, @shared/, @assets/)

## Backend Architecture
- **Runtime**: Node.js with Express.js framework
- **Language**: TypeScript with ESM module support
- **API Design**: RESTful endpoints for groundwater data and chat functionality
- **Request Logging**: Custom middleware for API request/response logging
- **Error Handling**: Centralized error handling middleware

## Data Storage
- **Database**: PostgreSQL with Drizzle ORM for type-safe database operations
- **Schema Management**: Drizzle Kit for migrations and schema management
- **Connection**: Neon Database serverless connection (@neondatabase/serverless)
- **Fallback Storage**: In-memory storage implementation for development/testing
- **Data Structure**: Normalized tables for users, groundwater assessments, and chat sessions

## Authentication & Authorization
- **Session Management**: PostgreSQL session store with connect-pg-simple
- **User Management**: Basic user authentication with username/password
- **Session Storage**: Database-backed sessions for persistence

## AI Integration
- **Provider**: OpenAI API integration for natural language processing
- **Query Processing**: Custom service for parsing groundwater-related queries
- **Response Generation**: AI-powered responses with structured data extraction
- **Language Support**: Multi-language support (English/Hindi) with automatic detection

## External Dependencies
- **Database**: PostgreSQL (via Neon Database serverless)
- **AI Services**: OpenAI API for chat completion and query parsing
- **Development Tools**: Replit-specific plugins for development environment integration
- **UI Components**: Radix UI primitives for accessible component foundation
- **Charts**: Chart.js integration for data visualization
- **Date Handling**: date-fns for date manipulation and formatting