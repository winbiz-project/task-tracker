# TaskTrack Lite

![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)
![Framework: Next.js](https://img.shields.io/badge/Framework-Next.js-blue.svg)
![Styling: Tailwind CSS](https://img.shields.io/badge/Styling-Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white)
![AI: Genkit](https://img.shields.io/badge/AI-Genkit-orange.svg)

A simple and powerful to-do list tracker built with Next.js and Firebase. It allows users to manage tasks through an intuitive interface with features like inline editing, real-time updates, and AI-powered assistance for a streamlined workflow.

## Key Features

- **Task CRUD**: Create, read, update, and delete tasks with real-time UI feedback.
- **Interactive Table**: A sortable, filterable, and paginated table for tasks with inline editing for task name, PIC, progress, and status.
- **Activity Logger**: Track all changes to a task, including who made the change and when, with a detailed history modal.
- **AI-Powered Description Generation**: Utilizes Google's Gemini model via Genkit to automatically generate detailed task descriptions based on the task name.

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (with App Router)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **Styling**: [Tailwind CSS](https://tailwindcss.com/) with [ShadCN UI](https://ui.shadcn.com/)
- **AI Integration**: [Genkit](https://firebase.google.com/docs/genkit)
- **UI**: [React](https://reactjs.org/)

## Getting Started

### Installation

1.  Clone the repository:
    ```bash
    git clone https://github.com/winbiz-project/tasktrack-lite.git
    cd tasktrack-lite
    ```
2.  Install the dependencies:
    ```bash
    npm install
    ```

### Environment Variables

To run this project, you will need to add the following environment variables to your `.env` file. This is required for the AI features to work.

`GOOGLE_API_KEY` - Your API key for Google AI services.

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

This project is licensed under the MIT License. See the [LICENSE](LICENSE) file for details.

## Contact

- **GitHub**: [winbiz-project](https://github.com/winbiz-project)
