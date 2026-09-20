# RepoLens

> Understand any public GitHub repository in minutes.

RepoLens is a web-based repository analysis platform that helps developers and students quickly understand unfamiliar GitHub projects.

Simply paste a public GitHub repository URL and RepoLens analyzes the codebase to provide insights into its structure, technologies, dependencies, architecture, and overall project health.

---

## Live Demo

**Live Application:**  
https://repo-lens-aonb71e9x-prasanna-rvssl.vercel.app

**GitHub Repository:**  
https://github.com/prasanna-rvssl/RepoLens

**Backend API:**  
https://repolens-backend-b8dt.onrender.com

---

## Problem

Understanding an unfamiliar GitHub repository can take a significant amount of time.

Developers and students often need to manually:

- Explore folders and files
- Identify programming languages
- Find frameworks and libraries
- Understand dependencies
- Trace the project architecture
- Read configuration files
- Figure out how different parts of the project connect

This process can become especially difficult when working with large or unfamiliar codebases.

---

## Solution

RepoLens automatically analyzes a public GitHub repository and presents the results through a clean and interactive dashboard.

Instead of manually exploring an entire repository, users can paste a GitHub URL and receive:

- Repository overview
- AI-generated project summary
- Interactive architecture visualization
- Programming language detection
- Framework and library detection
- Dependency analysis
- Repository structure
- Project configuration information
- Project health insights

RepoLens helps reduce the time and effort required to understand unfamiliar codebases.

---

# Features

## 1. Repository Analysis

Users can enter the URL of a public GitHub repository and start an automated analysis.

RepoLens examines the repository structure and available files to identify important project information.

The analysis includes:

- Repository structure
- Important files
- Technologies used
- Dependencies
- Configuration files
- Project architecture
- General project characteristics

---

## 2. AI-Powered Project Summary

RepoLens can generate an easy-to-understand summary of the analyzed repository.

The AI analysis helps explain:

- What the project does
- The purpose of major components
- How the project is organized
- Important technologies
- Key observations about the codebase

The goal is to make technical repositories easier to understand, especially for students and developers working with unfamiliar projects.

---

## 3. RepoMap

RepoLens generates an interactive visual representation of the repository architecture.

The RepoMap helps users understand how major parts of the project relate to one another without manually navigating through every folder and file.

Users can:

- Explore major project components
- View relationships between components
- Understand the architecture visually
- Navigate the architecture interactively
- Download the RepoMap

---

## 4. Tech Stack Detection

RepoLens automatically identifies technologies used within the repository.

The dashboard organizes detected technologies into categories such as:

### Languages

Programming languages detected from the repository.

### Frameworks & Libraries

Major frameworks and libraries identified from project files and dependencies.

### Dependencies

Packages and dependencies used by the project.

### Project Configuration

Important configuration files and project setup information.

---

## 5. Repository Structure

RepoLens analyzes the organization of the repository and presents its structure in an understandable format.

This helps users identify:

- Source code directories
- Frontend components
- Backend components
- Configuration files
- Documentation
- Dependency files
- Important project resources

---

## 6. Project Health

RepoLens provides project health observations based on information available from the analyzed repository.

This section helps users quickly identify characteristics of the project structure and areas that may require attention.

---

# How RepoLens Works

```text
                    GitHub Repository URL
                              │
                              ▼
                    ┌──────────────────┐
                    │  React Frontend  │
                    │   Vite + React   │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │  FastAPI Backend │
                    │     Python       │
                    └────────┬─────────┘
                             │
                 ┌───────────┴───────────┐
                 │                       │
                 ▼                       ▼
        ┌─────────────────┐     ┌──────────────────┐
        │   GitHub API    │     │ Repository       │
        │                 │     │ Scanner          │
        └────────┬────────┘     └────────┬─────────┘
                 │                       │
                 └───────────┬───────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ Analysis Engine  │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │   AI Analysis    │
                    │    (Optional)    │
                    └────────┬─────────┘
                             │
                             ▼
                    ┌──────────────────┐
                    │ React Dashboard  │
                    └────────┬─────────┘
                             │
              ┌──────────────┼──────────────┐
              ▼              ▼              ▼
         AI Summary       RepoMap       Tech Stack
                                             │
                                             ▼
                                      Project Health
