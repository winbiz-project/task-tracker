# TaskTrack

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js-blue.svg)
![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![AI: Genkit](https://img.shields.io/badge/AI-Genkit-orange.svg)
![Database: Firestore](https://img.shields.io/badge/Database-Firestore-FFCA28?logo=firebase&logoColor=white)

A simple and powerful to-do list tracker built with Next.js and Firebase. It allows users to manage tasks through an intuitive interface with features like real-time updates, inline editing, and AI-powered assistance for a streamlined workflow.

## Key Features

- **User Authentication**: Secure user registration and login with Email/Password and Google providers.
- **Profile Management**: Users can update their display name and change their password.
- **Real-Time Database**: Utilizes Firebase Firestore for live data synchronization across all clients.
- **Full Task Management (CRUD)**: Create, read, update, and delete tasks with real-time UI feedback.
- **Interactive Task Table**:
    - Inline editing for task name, person-in-charge (PIC), and progress notes directly in the table.
    - Quick status changes via a dropdown menu.
- **AI-Powered Description Generation**: Uses Google's Gemini model via Genkit to automatically generate detailed task descriptions based on the task name.
- **Detailed Task History**: A comprehensive activity log for each task, showing who made what change and when.
- **Responsive Design**: A clean, intuitive UI that works seamlessly on both desktop and mobile devices.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/)
- **Authentication & Database**: [Firebase](https://firebase.google.com/) (Auth & Firestore)
- **AI Integration**: [Google AI & Genkit](https://firebase.google.com/docs/genkit)
- **UI**: [React](https://reactjs.org/)

## Getting Started

### Prerequisites

You must have a [Firebase project](https://firebase.google.com/docs/web/setup) set up.

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/winbiz-project/dw-tasktrack.git
    cd dw-tasktrack
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file.

- **`GOOGLE_API_KEY`**: Your API key for Google AI services. Required for AI features.
- **`NEXT_PUBLIC_FIREBASE_*`**: Your Firebase project's web app configuration keys. You can find these in your Firebase project settings under **Project settings > General > Your apps > SDK setup and configuration > Config**.

### Firebase Configuration

1.  **Enable Firestore**: In your Firebase project, go to **Build > Firestore Database** and create a database.
2.  **Enable Authentication Providers**:
    - Go to **Build > Authentication** and select the **Sign-in method** tab.
    - Enable the **Email/Password** and **Google** providers.

### How to Run

The application requires two separate development servers to be running concurrently: one for the Next.js frontend and one for the Genkit AI flows.

1.  **Start the Next.js development server:**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:9002`.

2.  **In a separate terminal, start the Genkit development server:**
    ```bash
    npm run genkit:dev
    ```
    This will start the Genkit development UI, typically on port `4000`, which you can use to monitor and test your AI flows.

## Project Status

**Production**: The application is ready for live use. Core features are stable and have been tested.

## License

This project is licensed under the MIT License. See the `LICENSE` file for details.

## Contact

- **GitHub**: [winbiz-project](https://github.com/winbiz-project)
