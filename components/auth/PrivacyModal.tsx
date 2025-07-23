import React from 'react';
import Icon from '../Icon';

interface PrivacyModalProps {
    onClose: () => void;
}

const PrivacyModal: React.FC<PrivacyModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-secondary shadow-2xl rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold">Privacy Policy</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-border-color">
                        <Icon name="close" className="h-6 w-6 text-text-secondary" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-text-secondary text-sm">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">1. Information We Collect</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Account Information:</strong> Your name, email address, and password (hashed).</li>
                        <li><strong>Profile Information:</strong> Date of birth, country, timezone, and any other details you provide.</li>
                        <li><strong>User Content:</strong> Notes, events, reminders, chat history, and any other data you create or input into the application.</li>
                        <li><strong>Usage Data:</strong> We may collect anonymized data about your interactions with the app to improve our services.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">2. How We Use Your Information</h3>
                    <ul className="list-disc list-inside space-y-1">
                        <li>To provide, maintain, and improve the application's services.</li>
                        <li>To personalize your experience.</li>
                        <li>To enable the Artificial Intelligence (AI) to function and provide you with relevant assistance.</li>
                        <li>To communicate with you about your account or our services.</li>
                    </ul>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">3. Data Storage and Processing</h3>
                    <p>Your data is stored both locally on your device for offline access and on secure servers provided by our backend partner, Supabase, located in the European Union. API calls containing your prompts and relevant context are sent to Google for processing by the Gemini language model.</p>
                    
                    <h3 className="text-lg font-semibold text-text-primary pt-2">4. AI Data Access</h3>
                    <p>To provide its features, our AI model has access to all User Content within your account. This is necessary for functions like summarizing your schedule, finding notes, and understanding context. We do not use your personal data to train the core AI models of our third-party providers like Google.</p>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">5. Third-Party Services</h3>
                    <p>We use the following third-party services:</p>
                    <ul className="list-disc list-inside space-y-1">
                        <li><strong>Supabase:</strong> For database hosting, authentication, and backend infrastructure.</li>
                        <li><strong>Google Gemini:</strong> For our core AI and language model processing.</li>
                    </ul>
                    <p>Their use of information is governed by their respective privacy policies.</p>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">6. Your Rights</h3>
                    <p>You have the right to access, correct, or delete your personal data. You can manage most of your data directly within the application or by contacting us for assistance.</p>
                </div>
            </div>
        </div>
    );
};

export default PrivacyModal;