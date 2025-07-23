import React from 'react';
import Icon from '../Icon';

interface TermsModalProps {
    onClose: () => void;
}

const TermsModal: React.FC<TermsModalProps> = ({ onClose }) => {
    return (
        <div className="fixed inset-0 bg-black bg-opacity-70 flex items-center justify-center z-50 p-4 animate-fade-in" onClick={onClose}>
            <div className="bg-secondary shadow-2xl rounded-lg max-w-2xl w-full max-h-[80vh] flex flex-col" onClick={e => e.stopPropagation()}>
                <div className="flex justify-between items-center p-4 border-b border-border-color">
                    <h2 className="text-xl font-bold">Terms of Use</h2>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-border-color">
                        <Icon name="close" className="h-6 w-6 text-text-secondary" />
                    </button>
                </div>
                <div className="flex-1 overflow-y-auto p-6 space-y-4 text-text-secondary text-sm">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>
                    <p>By using Nexus AI ("the Service"), you agree to these terms. Please read them carefully.</p>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">1. User Accounts</h3>
                    <p>You are responsible for safeguarding your account and for any activities or actions under your password. We prohibit the creation of multiple accounts by a single user ("multi-accounting").</p>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">2. Prohibited Conduct</h3>
                    <p>You agree not to misuse the Service. This includes, but is not limited to: attempting to reverse engineer the application, exploiting bugs, using the service for illegal activities, or interfering with our systems.</p>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">3. Subscriptions and Payments</h3>
                    <p>Certain features of the Service may be subject to payment now or in the future ("Paid Features"). By subscribing to such features, you agree to our pricing and payment terms.</p>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">4. Disclaimer of Warranties & Limitation of Liability</h3>
                    <p className="font-bold text-amber-400">The Service is provided "as is". The AI is a powerful tool, but it is not infallible. It may make mistakes, misinterpret your commands, generate incorrect information, or accidentally delete data. All recommendations and actions taken by the AI are not guaranteed. You use the Service and its AI capabilities at your own risk. We are not responsible for any loss of data, damages, or other liabilities arising from your use of the Service.</p>

                    <h3 className="text-lg font-semibold text-text-primary pt-2">5. Termination</h3>
                    <p>We may terminate or suspend your account immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.</p>
                </div>
            </div>
        </div>
    );
};

export default TermsModal;