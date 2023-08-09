import React from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';

const GDPRPage = () => {
  return (
    <div>
        <Header />
    <div className="max-w-3xl mx-auto p-4 flex flex-col min-h-screen"
        style={{
            paddingTop: '100px',
        }}
    >

      <h2 className="text-2xl font-bold mb-4">GDPR Compliance</h2>
      <p>
        VGC Hub is committed to protecting the rights and privacy of individuals in accordance with the General Data Protection Regulation (GDPR).
      </p>
      <h3 className="text-xl font-semibold my-4">Your Rights</h3>
      <p>
        Under GDPR, you have certain rights regarding your personal data:
      </p>
      <ul className="list-disc ml-6 my-2">
        <li>Right to Access: You can request access to the personal data we hold about you.</li>
        <li>Right to Rectification: You can request correction of your personal data if it's inaccurate or incomplete.</li>
        <li>Right to Erasure: You can request the deletion of your personal data.</li>
        <li>Right to Restrict Processing: You can request the restriction of processing of your personal data under certain circumstances.</li>
        <li>Right to Data Portability: You can request a copy of your personal data in a structured, machine-readable format.</li>
        <li>Right to Object: You can object to the processing of your personal data under certain conditions.</li>
      </ul>
      <h3 className="text-xl font-semibold my-4">Data Processing</h3>
      <p>
        We collect and process your personal data for legitimate purposes, such as providing our services and improving our platform. We only retain your data for as long as necessary to fulfill these purposes.
      </p>
      <h3 className="text-xl font-semibold my-4">Data Security</h3>
      <p>
        We implement technical and organizational measures to ensure the security and confidentiality of your personal data.
      </p>
      <h3 className="text-xl font-semibold my-4">Contact Us</h3>
      <p>
        If you have any questions or wish to exercise your rights under GDPR, please contact us at vgchubdev@gmail.com.
      </p>
      <p>
        For more details about our data processing practices, please refer to our <a
            className="text-blue-500 hover:underline"
         href="/privacy">Privacy Policy</a>.
      </p>
    </div>
    <Footer />
    </div>
  );

};

export default GDPRPage;
