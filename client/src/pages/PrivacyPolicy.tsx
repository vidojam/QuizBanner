import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Privacy Policy</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-sm text-muted-foreground">Last Updated: December 3, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Introduction</h2>
            <p>
              QuizBanner ("we", "our", or "us") respects your privacy and is committed to protecting your personal data. 
              This Privacy Policy explains how we collect, use, and safeguard your information when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Information We Collect</h2>
            
            <h3 className="text-xl font-semibold mt-6 mb-3">2.1 Information You Provide</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Account Information:</strong> Email address, name (optional), and password (encrypted)</li>
              <li><strong>Payment Information:</strong> Payment details processed securely through Stripe (we do not store credit card numbers)</li>
              <li><strong>User Content:</strong> Questions, answers, and customization preferences you create</li>
            </ul>

            <h3 className="text-xl font-semibold mt-6 mb-3">2.2 Automatically Collected Information</h3>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Usage Data:</strong> How you interact with our service, features used, and session duration</li>
              <li><strong>Device Information:</strong> Browser type, operating system, and device identifiers</li>
              <li><strong>Local Storage:</strong> Guest user identifiers stored locally on your device</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. How We Use Your Information</h2>
            <p>
              We use the collected information to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Provide, maintain, and improve our service</li>
              <li>Process payments and manage subscriptions</li>
              <li>Send service-related communications and updates</li>
              <li>Respond to your requests and provide customer support</li>
              <li>Analyze usage patterns to enhance user experience</li>
              <li>Detect and prevent fraud or abuse</li>
              <li>Comply with legal obligations</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Data Storage and Security</h2>
            <p>
              We implement appropriate technical and organizational measures to protect your personal data:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Passwords are encrypted using industry-standard hashing algorithms</li>
              <li>Payment information is processed through Stripe's secure payment infrastructure</li>
              <li>Data is stored in secure databases with access controls</li>
              <li>Regular security assessments and updates</li>
            </ul>
            <p className="mt-4">
              However, no method of transmission over the internet is 100% secure. While we strive to protect your data, 
              we cannot guarantee absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Data Sharing and Disclosure</h2>
            <p>
              We do not sell your personal information. We may share your data only in the following circumstances:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Service Providers:</strong> Stripe for payment processing (subject to their privacy policy)</li>
              <li><strong>Legal Requirements:</strong> When required by law or to protect our rights</li>
              <li><strong>Business Transfers:</strong> In connection with a merger, acquisition, or sale of assets</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. Guest Users</h2>
            <p>
              If you use QuizBanner as a guest:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>A unique guest identifier is stored in your browser's local storage</li>
              <li>Your questions and preferences are associated with this identifier</li>
              <li>If you make a premium purchase, your email is required for transaction records</li>
              <li>You can convert to a registered account at any time to access your data across devices</li>
              <li>Clearing your browser data will remove your guest identifier and local data</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Cookies and Tracking</h2>
            <p>
              We use browser local storage and session storage to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintain your login session</li>
              <li>Store guest user identifiers</li>
              <li>Remember your preferences</li>
              <li>Improve service performance</li>
            </ul>
            <p className="mt-4">
              You can control storage settings through your browser, but this may affect service functionality.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Your Rights</h2>
            <p>
              You have the right to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li><strong>Access:</strong> Request a copy of your personal data</li>
              <li><strong>Correction:</strong> Update or correct inaccurate information</li>
              <li><strong>Deletion:</strong> Request deletion of your account and associated data</li>
              <li><strong>Export:</strong> Receive your data in a portable format</li>
              <li><strong>Opt-out:</strong> Unsubscribe from marketing communications</li>
            </ul>
            <p className="mt-4">
              To exercise these rights, please contact us through the application.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Data Retention</h2>
            <p>
              We retain your personal data for as long as necessary to provide the service and fulfill the purposes outlined in this policy. 
              When you delete your account, we will delete or anonymize your data within a reasonable timeframe, 
              except where required by law to retain certain information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Children's Privacy</h2>
            <p>
              QuizBanner is not intended for children under 13 years of age. We do not knowingly collect personal information 
              from children under 13. If you become aware that a child has provided us with personal data, please contact us, 
              and we will take steps to delete such information.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. International Data Transfers</h2>
            <p>
              Your information may be transferred to and maintained on servers located outside of your jurisdiction, 
              where data protection laws may differ. By using our service, you consent to the transfer of your information 
              to these locations.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to This Privacy Policy</h2>
            <p>
              We may update this Privacy Policy from time to time. We will notify you of any material changes by posting 
              the new policy on this page and updating the "Last Updated" date. Your continued use of the service after 
              changes constitutes acceptance of the updated policy.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Us</h2>
            <p>
              If you have questions or concerns about this Privacy Policy or our data practices, please{" "}
              <Link href="/contact">
                <a className="text-primary hover:underline">contact us</a>
              </Link>
              {" "}or email us at{" "}
              <a href="mailto:vidojam@gmail.com" className="text-primary hover:underline">
                vidojam@gmail.com
              </a>
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">14. Third-Party Services</h2>
            <p>
              Our service uses Stripe for payment processing. Stripe's use of your personal information is governed by 
              their privacy policy, which can be found at{" "}
              <a href="https://stripe.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                stripe.com/privacy
              </a>.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
