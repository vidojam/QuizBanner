import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export default function TermsOfService() {
  return (
    <div className="min-h-screen bg-background p-8">
      <div className="max-w-4xl mx-auto">
        <Link href="/">
          <Button variant="ghost" className="mb-6">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </Link>

        <h1 className="text-4xl font-bold mb-8">Terms of Service</h1>
        
        <div className="prose prose-slate dark:prose-invert max-w-none space-y-6">
          <p className="text-sm text-muted-foreground">Last Updated: December 3, 2025</p>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">1. Acceptance of Terms</h2>
            <p>
              By accessing and using QuizBanner, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to these Terms of Service, please do not use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">2. Description of Service</h2>
            <p>
              QuizBanner provides a digital platform for creating, managing, and displaying educational question-and-answer banners. 
              The service is available in both free and premium tiers, with premium features including unlimited questions, 
              customization options, and advanced display modes.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">3. User Accounts</h2>
            <p>
              You may use QuizBanner as a guest user or create a registered account. You are responsible for:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Maintaining the confidentiality of your account credentials</li>
              <li>All activities that occur under your account</li>
              <li>Notifying us immediately of any unauthorized use</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">4. Payment and Subscriptions</h2>
            <p>
              Premium features require payment. By purchasing premium access:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>You authorize us to charge your payment method for the stated price</li>
              <li>All payments are processed securely through Stripe</li>
              <li>Guest purchases are linked to the email address provided</li>
              <li>Premium access begins immediately upon successful payment</li>
              <li>Prices are subject to change with notice to existing subscribers</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">5. Refund Policy</h2>
            <p>
              We offer refunds within 14 days of purchase if you are not satisfied with the premium service. 
              To request a refund, please contact us with your purchase details.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">6. User Content</h2>
            <p>
              You retain ownership of the questions and answers you create. By using our service, you grant us:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>The right to store and display your content as necessary to provide the service</li>
              <li>Permission to make backup copies for service reliability</li>
            </ul>
            <p className="mt-4">
              You are responsible for ensuring your content does not violate any laws or third-party rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">7. Prohibited Uses</h2>
            <p>
              You agree not to:
            </p>
            <ul className="list-disc pl-6 space-y-2">
              <li>Use the service for any illegal purpose</li>
              <li>Attempt to gain unauthorized access to our systems</li>
              <li>Interfere with or disrupt the service</li>
              <li>Upload malicious code or harmful content</li>
              <li>Harass, abuse, or harm other users</li>
              <li>Use automated systems to access the service without permission</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">8. Service Modifications</h2>
            <p>
              We reserve the right to modify or discontinue the service at any time, with or without notice. 
              We will not be liable to you or any third party for any modification, suspension, or discontinuance of the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">9. Disclaimer of Warranties</h2>
            <p>
              The service is provided "as is" and "as available" without warranties of any kind, either express or implied. 
              We do not guarantee that the service will be uninterrupted, secure, or error-free.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">10. Limitation of Liability</h2>
            <p>
              To the maximum extent permitted by law, QuizBanner shall not be liable for any indirect, incidental, special, 
              consequential, or punitive damages resulting from your use or inability to use the service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">11. Termination</h2>
            <p>
              We may terminate or suspend your account and access to the service immediately, without prior notice, 
              for any breach of these Terms of Service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">12. Changes to Terms</h2>
            <p>
              We reserve the right to update these Terms of Service at any time. We will notify users of any material changes. 
              Your continued use of the service after changes constitutes acceptance of the new terms.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-semibold mt-8 mb-4">13. Contact Information</h2>
            <p>
              For questions about these Terms of Service, please{" "}
              <Link href="/contact">
                <a className="text-primary hover:underline">contact us</a>
              </Link>
              {" "}or email us at{" "}
              <a href="mailto:vidojam@gmail.com" className="text-primary hover:underline">
                vidojam@gmail.com
              </a>
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
