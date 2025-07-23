import React from 'react';
import { RunningApp } from '../types';

interface ScriptRendererProps {
    app: RunningApp;
}

const ScriptRenderer: React.FC<ScriptRendererProps> = ({ app }) => {
    const srcDoc = `
        <html>
            <head>
                <style>
                    body { margin: 0; background-color: #1a1a1a; color: #f0f0f0; font-family: sans-serif; }
                    ${app.css}
                </style>
            </head>
            <body>
                ${app.html}
                <script>${app.javascript}</script>
            </body>
        </html>
    `;

    return (
        <iframe
            srcDoc={srcDoc}
            sandbox="allow-scripts allow-forms"
            className="absolute inset-0 w-full h-full z-0 border-0"
            title={app.title}
            scrolling="yes"
        />
    );
};

export default ScriptRenderer;
