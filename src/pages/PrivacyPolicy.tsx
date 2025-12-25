import { Layout } from "@/components/layout/Layout";

const PrivacyPolicy = () => {
  const lastUpdated = "December 25, 2025";

  return (
    <Layout>
      <div className="min-h-screen bg-background py-16">
        <div className="container mx-auto px-4 max-w-4xl">
          <h1 className="text-4xl font-bold text-foreground mb-2">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last Updated: {lastUpdated}</p>

          <div className="prose prose-lg dark:prose-invert max-w-none space-y-8">
            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">1. Introduction</h2>
              <p className="text-muted-foreground leading-relaxed">
                Welcome to DomForgeAI ("Company," "we," "us," or "our"). This Privacy Policy explains how we collect, 
                use, disclose, and safeguard your information when you visit our website and use our AI-powered 
                microservice generation platform (collectively, the "Service"). Please read this privacy policy 
                carefully. By accessing or using the Service, you acknowledge that you have read, understood, and 
                agree to be bound by all the terms of this Privacy Policy. If you do not agree with the terms of 
                this Privacy Policy, please do not access or use the Service.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">2. Information We Collect</h2>
              <div className="space-y-4 text-muted-foreground leading-relaxed">
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">2.1 Personal Information</h3>
                  <p>
                    We may collect personal information that you voluntarily provide to us when you register for 
                    an account, express interest in obtaining information about us or our products, participate 
                    in activities on the Service, or otherwise contact us. This may include:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Name, email address, and contact information</li>
                    <li>Account credentials and authentication data</li>
                    <li>Payment and billing information</li>
                    <li>Project requirements and business descriptions you provide</li>
                    <li>Communication preferences</li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-medium text-foreground mb-2">2.2 Automatically Collected Information</h3>
                  <p>
                    When you access our Service, we may automatically collect certain information, including:
                  </p>
                  <ul className="list-disc list-inside mt-2 space-y-1">
                    <li>Device and browser information</li>
                    <li>IP address and location data</li>
                    <li>Usage patterns and interaction data</li>
                    <li>Cookies and similar tracking technologies</li>
                  </ul>
                </div>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">3. How We Use Your Information</h2>
              <div className="text-muted-foreground leading-relaxed">
                <p className="mb-4">We use the information we collect for various purposes, including:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>To provide, operate, and maintain our Service</li>
                  <li>To process your transactions and manage your account</li>
                  <li>To generate microservice architectures based on your requirements</li>
                  <li>To improve, personalize, and expand our Service</li>
                  <li>To communicate with you about updates, security alerts, and support</li>
                  <li>To detect, prevent, and address technical issues and security threats</li>
                  <li>To comply with legal obligations and enforce our terms</li>
                </ul>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">4. Data Sharing and Disclosure</h2>
              <div className="text-muted-foreground leading-relaxed">
                <p className="mb-4">
                  We do not sell, trade, or rent your personal information to third parties. We may share your 
                  information only in the following circumstances:
                </p>
                <ul className="list-disc list-inside space-y-2">
                  <li><strong>Service Providers:</strong> We may share data with third-party vendors who perform services on our behalf</li>
                  <li><strong>Legal Requirements:</strong> We may disclose information if required by law or in response to valid legal requests</li>
                  <li><strong>Business Transfers:</strong> In connection with any merger, sale, or acquisition of company assets</li>
                  <li><strong>With Your Consent:</strong> We may share information for any other purpose with your explicit consent</li>
                </ul>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">5. Data Security</h2>
              <p className="text-muted-foreground leading-relaxed">
                We implement appropriate technical and organizational security measures designed to protect your 
                personal information against unauthorized access, alteration, disclosure, or destruction. However, 
                no method of transmission over the Internet or electronic storage is 100% secure. While we strive 
                to use commercially acceptable means to protect your personal information, we cannot guarantee its 
                absolute security. You acknowledge and accept that any transmission of information is at your own risk.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">6. Data Retention</h2>
              <p className="text-muted-foreground leading-relaxed">
                We retain your personal information only for as long as necessary to fulfill the purposes for which 
                it was collected, including to satisfy any legal, accounting, or reporting requirements. When we no 
                longer need to process your personal information, we will either delete or anonymize it, or, if this 
                is not possible, we will securely store your personal information and isolate it from further processing 
                until deletion is possible.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">7. Your Rights and Choices</h2>
              <div className="text-muted-foreground leading-relaxed">
                <p className="mb-4">Depending on your location, you may have certain rights regarding your personal information:</p>
                <ul className="list-disc list-inside space-y-2">
                  <li>Right to access and obtain a copy of your personal data</li>
                  <li>Right to rectify inaccurate or incomplete information</li>
                  <li>Right to request deletion of your personal data</li>
                  <li>Right to restrict or object to processing</li>
                  <li>Right to data portability</li>
                  <li>Right to withdraw consent at any time</li>
                </ul>
                <p className="mt-4">
                  To exercise any of these rights, please contact us using the information provided below.
                </p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">8. Cookies and Tracking Technologies</h2>
              <p className="text-muted-foreground leading-relaxed">
                We use cookies and similar tracking technologies to track activity on our Service and hold certain 
                information. Cookies are files with small amounts of data which may include an anonymous unique 
                identifier. You can instruct your browser to refuse all cookies or to indicate when a cookie is 
                being sent. However, if you do not accept cookies, you may not be able to use some portions of our Service.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">9. Third-Party Services</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service may contain links to third-party websites or services that are not operated by us. We 
                have no control over, and assume no responsibility for, the content, privacy policies, or practices 
                of any third-party websites or services. We strongly advise you to review the privacy policy of every 
                site you visit. This Privacy Policy applies solely to information collected by our Service.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">10. Children's Privacy</h2>
              <p className="text-muted-foreground leading-relaxed">
                Our Service is not intended for use by children under the age of 18. We do not knowingly collect 
                personal information from children under 18. If you are a parent or guardian and you are aware that 
                your child has provided us with personal information, please contact us. If we become aware that we 
                have collected personal information from children without verification of parental consent, we take 
                steps to remove that information from our servers.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">11. International Data Transfers</h2>
              <p className="text-muted-foreground leading-relaxed">
                Your information may be transferred to and maintained on computers located outside of your state, 
                province, country, or other governmental jurisdiction where the data protection laws may differ from 
                those in your jurisdiction. By using our Service, you consent to such transfers. We will take all 
                reasonable steps to ensure that your data is treated securely and in accordance with this Privacy Policy.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">12. Changes to This Privacy Policy</h2>
              <p className="text-muted-foreground leading-relaxed">
                We may update our Privacy Policy from time to time. We will notify you of any changes by posting the 
                new Privacy Policy on this page and updating the "Last Updated" date. You are advised to review this 
                Privacy Policy periodically for any changes. Changes to this Privacy Policy are effective when they 
                are posted on this page. Your continued use of the Service after any modifications indicates your 
                acceptance of the updated Privacy Policy.
              </p>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">13. Contact Us</h2>
              <p className="text-muted-foreground leading-relaxed">
                If you have any questions about this Privacy Policy or our data practices, please contact us at:
              </p>
              <div className="mt-4 text-foreground">
                <p><strong>DomForgeAI</strong></p>
                <p className="text-muted-foreground">Email: privacy@domforgeai.com</p>
              </div>
            </section>

            <section className="bg-card border border-border rounded-lg p-6">
              <h2 className="text-2xl font-semibold text-foreground mb-4">14. Disclaimer</h2>
              <p className="text-muted-foreground leading-relaxed">
                This Privacy Policy is provided for informational purposes only and does not constitute legal advice. 
                We recommend consulting with a qualified legal professional for specific privacy and data protection 
                concerns. By using our Service, you acknowledge that you have read and understood this Privacy Policy 
                and agree to its terms.
              </p>
            </section>
          </div>
        </div>
      </div>
    </Layout>
  );
};

export default PrivacyPolicy;
